import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runSaga } from 'redux-saga';
import type { UnknownAction } from '@reduxjs/toolkit';
import {
  allText,
  byLabel,
  byTestId,
  press,
  render,
  renderAdmin,
  resetMockApis,
  typeInto,
} from '../../../shared/testing/testUtils';
import RootNavigator from '../../../app/navigation/RootNavigator';
import { createStore } from '../../../app/store';
import { N1ThemeProvider } from '../../../shared/components';
import { profileApi } from '../api/profileApi';
import {
  changePassword,
  fetchSession,
  updateProfile,
} from '../store/profileSaga';
import { profileActions } from '../store/profileSlice';

const SAFE_AREA = {
  frame: { x: 0, y: 0, width: 1280, height: 900 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(() => jest.restoreAllMocks());

test('shows the signed-in admin with organization code', async () => {
  const h = await renderAdmin('MyProfile');
  const text = allText(h.root);
  expect(text).toContain('Koushik Dasarathan');
  expect(text).toContain('Founder & Administrator · ABC Engineering Pvt Ltd');
  expect(text).toContain('ABC Engineering Pvt Ltd · ABC001');
  expect(text).toContain('Member since');
  expect(text).toContain('Signed in as the account owner');
});

test('edits the profile and validates the phone number', async () => {
  const h = await renderAdmin('MyProfile');
  await press(byTestId(h.root, 'edit-profile'));
  await typeInto(byTestId(h.root, 'profile-form-phone'), '123');
  await press(byTestId(h.root, 'profile-form-submit'));
  expect(allText(h.root)).toContain('Enter a valid phone number');
  await typeInto(byTestId(h.root, 'profile-form-phone'), '+91 90000 11111');
  await typeInto(byTestId(h.root, 'profile-form-name'), 'Koushik D');
  await press(byTestId(h.root, 'profile-form-submit'));
  expect(h.store.getState().profile.profile).toMatchObject({
    name: 'Koushik D',
    phone: '+91 90000 11111',
  });
  // The shell's top bar follows the new name.
  expect(allText(h.root)).toContain('Koushik D');
});

test('change password checks the rules before saving', async () => {
  const spy = jest.spyOn(profileApi, 'changePassword');
  const h = await renderAdmin('MyProfile');
  await press(byTestId(h.root, 'change-password'));
  await press(byTestId(h.root, 'password-form-submit'));
  expect(allText(h.root)).toContain('This field is required');
  const inputs = ['Current password', 'New password', 'Confirm password'].map(
    label => byLabel(h.root, label),
  );
  await typeInto(inputs[0], 'oldpass1');
  await typeInto(inputs[1], 'newpass12');
  await typeInto(inputs[2], 'different1');
  await press(byTestId(h.root, 'password-form-submit'));
  expect(spy).not.toHaveBeenCalled();
  await typeInto(inputs[2], 'newpass12');
  await press(byTestId(h.root, 'password-form-submit'));
  expect(spy).toHaveBeenCalledWith({
    currentPassword: 'oldpass1',
    newPassword: 'newpass12',
  });
  expect(allText(h.root)).not.toContain(
    'Choose a new password for your account.',
  );
});

test('log out asks first, then returns to the login screen', async () => {
  resetMockApis();
  const store = createStore();
  const app = await render(
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={SAFE_AREA}>
        <N1ThemeProvider>
          <RootNavigator />
        </N1ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  const root = app.root;
  await press(byLabel(root, 'Log in'));
  await press(byLabel(root, 'Open my profile'));
  await press(byTestId(root, 'logout'));
  expect(allText(root)).toContain('Log out?');
  const [, confirm] = root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityLabel === 'Log out',
  );
  await press(confirm);
  expect(store.getState().profile.signedOut).toBe(true);
  expect(allText(root)).toContain('Welcome to N1');
  expect(allText(root)).not.toContain('Koushik Dasarathan');

  // Signing in again reloads the session.
  await press(byLabel(root, 'Log in'));
  await press(byLabel(root, 'Open my profile'));
  expect(store.getState().profile.status).toBe('succeeded');
  expect(allText(root)).toContain('Signed in as the account owner');
});

test('phone layout: logout icon in the header, contact card', async () => {
  mockWidth = 390;
  const h = await renderAdmin('MyProfile');
  expect(allText(h.root)).toContain('Contact details');
  await press(byLabel(h.root, 'Log out'));
  expect(allText(h.root)).toContain('Log out?');
});

async function record(saga: (a: never) => Generator, action?: UnknownAction) {
  const out: UnknownAction[] = [];
  await runSaga(
    { dispatch: (a: UnknownAction) => out.push(a) },
    saga as (...args: unknown[]) => Generator,
    action,
  ).toPromise();
  return out;
}

test('profile sagas report failures', async () => {
  jest.spyOn(profileApi, 'fetchSession').mockRejectedValue(new Error('down'));
  jest.spyOn(profileApi, 'updateProfile').mockRejectedValue('x');
  jest
    .spyOn(profileApi, 'changePassword')
    .mockRejectedValue(new Error('wrong password'));
  expect(await record(fetchSession)).toEqual([
    profileActions.fetchSessionFailure('down'),
  ]);
  expect(
    await record(
      updateProfile,
      profileActions.updateProfileRequest({
        name: 'a',
        designation: '',
        phone: '',
      }),
    ),
  ).toEqual([
    profileActions.updateProfileFailure('Failed to save your profile'),
  ]);
  expect(
    await record(
      changePassword,
      profileActions.changePasswordRequest({
        currentPassword: 'a',
        newPassword: 'b',
      }),
    ),
  ).toEqual([profileActions.changePasswordFailure('wrong password')]);
});

test('the user in the top bar opens My profile; back returns', async () => {
  const h = await renderAdmin('Billing');
  await press(byLabel(h.root, 'Open my profile'));
  expect(h.currentRoute()).toBe('MyProfile');
  expect(allText(h.root)).toContain('Signed in as the account owner');
  await press(byLabel(h.root, 'Back'));
  expect(h.currentRoute()).toBe('Billing');
});

test('phone: the avatar and the menu user card open My profile', async () => {
  mockWidth = 390;
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'open-profile'));
  expect(h.currentRoute()).toBe('MyProfile');
  await h.navigate('Orders');
  await press(byTestId(h.root, 'sidebar-open-profile'));
  expect(h.currentRoute()).toBe('MyProfile');
});
