import ReactTestRenderer from 'react-test-renderer';
import {
  allText,
  byLabel,
  byTestId,
  logIn as fillLogin,
  press,
  renderAppAs,
  typeInto,
} from '../../../shared/testing/testUtils';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
}));

let app: ReactTestRenderer.ReactTestRenderer | undefined;

// Only one linked NavigationContainer may be mounted at a time, or React
// Navigation logs a warning from a timer that can outlive the test file.
afterEach(async () => {
  await ReactTestRenderer.act(() => app?.unmount());
  app = undefined;
});

async function logIn(email: string, password: string) {
  app = await renderAppAs(email, password);
  return app.root;
}

const selected = (root: ReactTestRenderer.ReactTestInstance, label: string) =>
  byLabel(root, label).props.accessibilityState?.selected;

test.each([
  [
    'secondadmin@n1.com',
    'SecondAdmin@123',
    'Second Admin',
    'Priya Sharma',
    'My Jobs',
  ],
  [
    'operator@n1.com',
    'Operator@123',
    'Machine Operator',
    'Ravi Kumar',
    '4 in progress · 5 total',
  ],
  ['qc@n1.com', 'Qc@12345', 'QC', 'Suresh Babu', '2 pending · 5 total'],
])(
  '%s lands on the %s Jobs tab and sees their own profile',
  async (email, password, role, name, jobsText) => {
    const root = await logIn(email, password);

    expect(selected(root, 'Jobs')).toBe(true);
    expect(allText(root)).toContain(jobsText);

    await press(byLabel(root, 'Profile'));

    expect(selected(root, 'Profile')).toBe(true);
    const text = allText(root);
    expect(text).toContain(name);
    expect(text).toContain(role);
  },
);

test('profile shows the design fields for the machine operator', async () => {
  const root = await logIn('operator@n1.com', 'Operator@123');
  await press(byLabel(root, 'Profile'));

  const text = allText(root);
  for (const value of [
    'EMP-1042',
    'Machining',
    'Morning (6 AM – 2 PM)',
    '14 Mar 2023',
    '+91 98765 43210',
    'ravi.kumar@abceng.com',
    'Log out',
  ]) {
    expect(text).toContain(value);
  }
});

test('edit profile saves changes and returns to the profile', async () => {
  const root = await logIn('operator@n1.com', 'Operator@123');
  await press(byLabel(root, 'Profile'));
  await press(byLabel(root, 'Edit profile'));

  expect(allText(root)).toContain('Edit Profile');
  expect(allText(root)).toContain('Change photo');

  await typeInto(byTestId(root, 'employee-form-name'), 'Ravi K');
  await press(byTestId(root, 'employee-form-submit'));

  expect(allText(root)).not.toContain('Edit Profile');
  expect(allText(root)).toContain('Ravi K');
});

test('edit profile blocks blank name and bad email', async () => {
  const root = await logIn('qc@n1.com', 'Qc@12345');
  await press(byLabel(root, 'Profile'));
  await press(byLabel(root, 'Edit profile'));

  await typeInto(byTestId(root, 'employee-form-name'), '  ');
  await typeInto(byTestId(root, 'employee-form-email'), 'not-an-email');
  await press(byTestId(root, 'employee-form-submit'));

  const text = allText(root);
  expect(text).toContain('Edit Profile');
  expect(text).toContain('This field is required');
  expect(text).toContain('Enter a valid email address');
});

test('closing edit profile discards changes', async () => {
  const root = await logIn('operator@n1.com', 'Operator@123');
  await press(byLabel(root, 'Profile'));
  await press(byLabel(root, 'Edit profile'));
  await typeInto(byTestId(root, 'employee-form-name'), 'Someone Else');
  await press(byLabel(root, 'Close'));

  expect(allText(root)).not.toContain('Someone Else');
  expect(allText(root)).toContain('Ravi Kumar');
});

test('log out asks first, then returns to login; next role loads its own profile', async () => {
  const root = await logIn('operator@n1.com', 'Operator@123');
  await press(byLabel(root, 'Profile'));
  await press(byTestId(root, 'employee-logout'));
  expect(allText(root)).toContain('Log out?');

  const [, confirm] = root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityLabel === 'Log out',
  );
  await press(confirm);
  expect(allText(root)).toContain('Welcome Back!');

  await fillLogin(root, 'qc@n1.com', 'Qc@12345');
  await press(byLabel(root, 'Profile'));

  expect(allText(root)).toContain('Suresh Babu');
  expect(allText(root)).not.toContain('Ravi Kumar');
});
