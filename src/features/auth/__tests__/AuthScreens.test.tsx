/**
 * @format
 */

import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { INDUSTRY_OPTIONS } from '../constants';
import CreateOrganizationScreen from '../screens/CreateOrganizationScreen';
import LoginScreen from '../screens/LoginScreen';
import {
  PHONE,
  WIDE,
  allText,
  findText,
  input,
  press,
  render,
  type,
} from '../../../shared/testing/render';

const mockNavigation = {
  reset: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => true),
  popTo: jest.fn(),
  getParent: jest.fn(),
};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

jest.mock('../../../shared/hooks/useN1Breakpoint', () => ({
  useN1Breakpoint: () => {
    const { width } = jest.requireActual(
      '../../../shared/testing/render',
    ).screenSize;
    return { width, isCompact: width < 768, isDesktop: width >= 1024 };
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigation.canGoBack.mockReturnValue(true);
});

describe('LoginScreen', () => {
  test('wide layout shows the hero panel, remember me and footer', async () => {
    const text = allText(await render(<LoginScreen />, WIDE));

    expect(text).toContain('Welcome to N1');
    expect(text).toContain(
      'N1 brings your organization, your team and your data together in one dashboard.',
    );
    expect(text).toContain('Remember me');
    expect(text).toContain('Forgot password?');
    expect(text).toContain('Create organization');
    expect(text).not.toContain('Welcome Back!');
  });

  test('compact layout shows the phone copy without hero or remember me', async () => {
    const text = allText(await render(<LoginScreen />, PHONE));

    expect(text).toContain('Welcome Back!');
    expect(text).toContain('Log in to your dashboard.');
    expect(text).toContain('Create organization');
    expect(text).not.toContain('Remember me');
    expect(text).not.toContain('Welcome to N1');
  });

  test.each([
    ['admin@n1.com', 'Admin@123', 'Admin'],
    ['secondadmin@n1.com', 'SecondAdmin@123', 'SecondAdmin'],
    ['  OPERATOR@n1.com ', 'Operator@123', 'MachineOperator'],
    ['qc@n1.com', 'Qc@12345', 'Qc'],
  ])('%s logs in to the %s screen', async (email, password, screen) => {
    const root = await render(<LoginScreen />, PHONE);

    await type(root, 'you@company.com', email);
    await type(root, 'Enter your password', password);
    await press(findText(root, 'Log in'));

    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Dashboard', params: { screen } }],
    });
  });

  test('wrong credentials show an error and stay on Login', async () => {
    const root = await render(<LoginScreen />, PHONE);

    await type(root, 'you@company.com', 'admin@n1.com');
    await type(root, 'Enter your password', 'wrong');
    await press(findText(root, 'Log in'));

    expect(mockNavigation.reset).not.toHaveBeenCalled();
    expect(allText(root)).toContain('Invalid email or password.');
  });

  test('remember me toggles', async () => {
    const root = await render(<LoginScreen />, WIDE);
    const checkbox = () =>
      root.findAll(
        node =>
          typeof node.type === 'string' &&
          node.props.accessibilityRole === 'checkbox',
      )[0];

    expect(checkbox().props.accessibilityState).toMatchObject({
      checked: false,
    });
    await press(findText(root, 'Remember me'));
    expect(checkbox().props.accessibilityState).toMatchObject({
      checked: true,
    });
  });

  test('"Forgot password?" opens the forgot password flow', async () => {
    const root = await render(<LoginScreen />, WIDE);

    await press(findText(root, 'Forgot password?'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', {
      screen: 'ForgotPasswordFlow',
      params: { screen: 'ForgotPassword' },
    });
  });

  test('"Create organization" opens the create organization screen', async () => {
    const root = await render(<LoginScreen />, WIDE);

    await press(findText(root, 'Create organization'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', {
      screen: 'CreateOrganization',
    });
  });
});

describe('CreateOrganizationScreen', () => {
  async function fillValidForm(root: ReactTestInstance) {
    await type(root, 'ABC Engineering Pvt Ltd', 'ABC Engineering Pvt Ltd');
    await ReactTestRenderer.act(() => {
      root
        .find(node => node.props.options === INDUSTRY_OPTIONS)
        .props.onChange('metal-manufacturing');
    });
    await type(root, 'owner@abcengineering.com', 'owner@abc.com');
    await type(root, '+91 98765 43210', '+91 98765 43210');
    await type(root, 'Create a password', 'secret123');
    await type(root, 'Re-enter password', 'secret123');
  }

  test('wide layout shows the hero tagline and full intro copy', async () => {
    const text = allText(await render(<CreateOrganizationScreen />, WIDE));

    expect(text).toContain(
      'Register your organization, get its unique code, and bring your team into one dashboard.',
    );
    expect(text).toContain(
      "You'll be the admin of this organization. Fields marked ",
    );
    expect(text).toContain('Already have an account?');
  });

  test('compact layout uses the short intro copy and no hero', async () => {
    const text = allText(await render(<CreateOrganizationScreen />, PHONE));

    expect(text).toContain("You'll be the admin. ");
    expect(text).not.toContain(
      'Register your organization, get its unique code, and bring your team into one dashboard.',
    );
  });

  test('organization code is generated from the name', async () => {
    const root = await render(<CreateOrganizationScreen />, WIDE);

    await type(root, 'ABC Engineering Pvt Ltd', 'ABC Engineering Pvt Ltd');

    expect(input(root, 'Generated from name').props.value).toBe('ABCENG');
  });

  test('submitting an empty form shows errors and stays on the screen', async () => {
    const root = await render(<CreateOrganizationScreen />, WIDE);

    await press(findText(root, 'Create organization'));
    const text = allText(root);

    expect(text).toContain('Enter the organization name');
    expect(text).toContain('Select an industry');
    expect(text).toContain('Enter a valid email');
    expect(text).toContain('Enter a phone number');
    expect(text).toContain('Passwords do not match');
    expect(mockNavigation.reset).not.toHaveBeenCalled();
  });

  test('errors stay hidden until the first submit', async () => {
    const text = allText(await render(<CreateOrganizationScreen />, WIDE));

    expect(text).not.toContain('Enter the organization name');
  });

  test('a valid form replaces the history with the Dashboard', async () => {
    const root = await render(<CreateOrganizationScreen />, PHONE);

    await fillValidForm(root);
    await press(findText(root, 'Create organization'));

    expect(mockNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  });

  test('mismatched passwords block submit', async () => {
    const root = await render(<CreateOrganizationScreen />, WIDE);

    await fillValidForm(root);
    await type(root, 'Re-enter password', 'different1');
    await press(findText(root, 'Create organization'));

    expect(allText(root)).toContain('Passwords do not match');
    expect(mockNavigation.reset).not.toHaveBeenCalled();
  });

  test('"Back to log in" goes back when there is history', async () => {
    const root = await render(<CreateOrganizationScreen />, WIDE);

    await press(findText(root, 'Back to log in'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('"Log in" opens Login when there is no history (deep link)', async () => {
    mockNavigation.canGoBack.mockReturnValue(false);
    const root = await render(<CreateOrganizationScreen />, WIDE);

    await press(findText(root, 'Log in'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Auth', {
      screen: 'Login',
    });
  });
});
