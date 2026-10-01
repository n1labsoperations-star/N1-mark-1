import { runSaga } from 'redux-saga';
import type { UnknownAction } from '@reduxjs/toolkit';
import {
  allText,
  byLabel,
  byTestId,
  byText,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';
import { profileApi } from '../api/profileApi';
import {
  changePassword,
  fetchSession,
  updateProfile,
} from '../store/profileSaga';
import { profileActions } from '../store/profileSlice';

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

test('log out asks first, then shows the signed-out placeholder', async () => {
  const h = await renderAdmin('MyProfile');
  await press(byTestId(h.root, 'logout'));
  expect(allText(h.root)).toContain('Log out?');
  const [, confirm] = h.root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityLabel === 'Log out',
  );
  await press(confirm);
  expect(h.store.getState().profile.signedOut).toBe(true);
  expect(allText(h.root)).toContain('You’re signed out');
  await press(byText(h.root, 'Sign in again'));
  expect(allText(h.root)).toContain('Koushik Dasarathan');
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
