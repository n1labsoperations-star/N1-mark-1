/**
 * @format
 */

import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { INDUSTRY_OPTIONS } from '../constants';
import CreateOrganizationScreen from '../screens/CreateOrganizationScreen';
import LoginScreen from '../screens/LoginScreen';
import { createStore } from '../../../app/store';
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

    expect(text).toContain('Get Started');
    expect(text).toContain(
      'N1 brings your organization, your team, and your data together in one simple workspace. Stay on top of daily operations, keep your team aligned, and get a clear view of your business from one dashboard.',
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
    expect(text).not.toContain('Get Started');
  });

  test.each([
    ['admin@n1.com', 'Admin@123', 'admin'],
    ['supervisor@n1.com', 'Supervisor@123', 'supervisor'],
    ['  OPERATOR@n1.com ', 'Operator@123', 'operator'],
    ['qc@n1.com', 'Qc@12345', 'qc'],
  ])('%s signs in as %s', async (email, password, role) => {
    const store = createStore();
    const root = await render(<LoginScreen />, PHONE, store);

    await type(root, 'you@company.com', email);
    await type(root, 'Enter your password', password);
    await press(findText(root, 'Log in'));

    // The root navigator then shows only that role's area.
    expect(store.getState().session.role).toBe(role);
    expect(mockNavigation.reset).not.toHaveBeenCalled();
  });

  test('wrong credentials show an error and stay on Login', async () => {
    const store = createStore();
    const root = await render(<LoginScreen />, PHONE, store);

    await type(root, 'you@company.com', 'admin@n1.com');
    await type(root, 'Enter your password', 'wrong');
    await press(findText(root, 'Log in'));

    expect(store.getState().session.role).toBeNull();
    expect(allText(root)).toContain('Invalid email or password.');
  });

  test('empty fields flag both email and password', async () => {
    const store = createStore();
    const root = await render(<LoginScreen />, PHONE, store);

    await press(findText(root, 'Log in'));
    expect(allText(root)).toContain('Email ID is required');
    expect(allText(root)).toContain('Password is required');
    expect(allText(root)).not.toContain('Invalid email or password.');
    expect(store.getState().session.role).toBeNull();

    // A badly formed email is flagged too; typing clears the password error.
    await type(root, 'you@company.com', 'admin');
    await type(root, 'Enter your password', 'Admin@123');
    await press(findText(root, 'Log in'));
    const text = allText(root);
    expect(text).toContain('Enter a valid email address');
    expect(text).not.toContain('Password is required');
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
      'N1 brings your organization, your team, and your data together in one simple workspace. Stay on top of daily operations, keep your team aligned, and get a clear view of your business from one dashboard.',
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
      'N1 brings your organization, your team, and your data together in one simple workspace. Stay on top of daily operations, keep your team aligned, and get a clear view of your business from one dashboard.',
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

  test('a valid form signs the new admin in', async () => {
    const store = createStore();
    const root = await render(<CreateOrganizationScreen />, PHONE, store);

    await fillValidForm(root);
    await press(findText(root, 'Create organization'));

    expect(store.getState().session.role).toBe('admin');
  });

  test('an invalid GST number blocks submit; blank is fine', async () => {
    const store = createStore();
    const root = await render(<CreateOrganizationScreen />, WIDE, store);

    await fillValidForm(root);
    await type(root, 'e.g. 33ABCDE1234F1Z5', 'ABC123');
    await press(findText(root, 'Create organization'));
    expect(allText(root)).toContain('Enter a valid 15-character GST number');
    expect(store.getState().session.role).toBeNull();

    await type(root, 'e.g. 33ABCDE1234F1Z5', '');
    await press(findText(root, 'Create organization'));
    expect(store.getState().session.role).toBe('admin');
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
