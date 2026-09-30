/**
 * @format
 */

import { useState } from 'react';
import * as RN from 'react-native';
import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import CodeInput from '../components/CodeInput';
import { ForgotPasswordProvider } from '../context/ForgotPasswordContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import {
  PHONE,
  WIDE,
  allText,
  findText,
  press,
  render,
  type,
} from '../../../shared/testing/render';

const mockParent = { popTo: jest.fn() };
const mockNavigation = {
  navigate: jest.fn(),
  popTo: jest.fn(),
  getParent: jest.fn(() => mockParent),
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

beforeEach(() => jest.clearAllMocks());

function digitBoxes(root: ReactTestInstance) {
  return root.findAll(
    node =>
      node.type === RN.TextInput &&
      String(node.props.accessibilityLabel).startsWith('Digit'),
  );
}

async function typeInBox(root: ReactTestInstance, index: number, text: string) {
  await ReactTestRenderer.act(() => {
    digitBoxes(root)[index].props.onChangeText(text);
  });
}

describe('ForgotPasswordScreen', () => {
  const renderScreen = (width = WIDE) =>
    render(
      <ForgotPasswordProvider>
        <ForgotPasswordScreen />
      </ForgotPasswordProvider>,
      width,
    );

  test('shows the tagline on wide screens only', async () => {
    const tagline =
      "Locked out? It happens. We'll get you back into your dashboard in a minute.";
    expect(allText(await renderScreen(WIDE))).toContain(tagline);
    expect(allText(await renderScreen(PHONE))).not.toContain(tagline);
  });

  test('an invalid email shows an error and does not continue', async () => {
    const root = await renderScreen();

    await type(root, 'you@company.com', 'not-an-email');
    await press(findText(root, 'Send code'));

    expect(allText(root)).toContain('Enter a valid email');
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  test('a valid email moves on to the code step', async () => {
    const root = await renderScreen();

    await type(root, 'you@company.com', 'owner@abc.com');
    await press(findText(root, 'Send code'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('VerifyCode');
  });

  test('"Back to log in" returns to Login in the auth stack', async () => {
    const root = await renderScreen(PHONE);

    await press(findText(root, 'Back to log in'));

    expect(mockParent.popTo).toHaveBeenCalledWith('Login');
  });
});

describe('VerifyCodeScreen', () => {
  const renderScreen = (width = WIDE) =>
    render(
      <ForgotPasswordProvider>
        <VerifyCodeScreen />
      </ForgotPasswordProvider>,
      width,
    );

  test('shows the email entered on the previous step', async () => {
    const root = await render(
      <ForgotPasswordProvider>
        <ForgotPasswordScreen />
        <VerifyCodeScreen />
      </ForgotPasswordProvider>,
      WIDE,
    );

    await type(root, 'you@company.com', 'owner@abc.com');
    await press(findText(root, 'Send code'));

    expect(allText(root)).toContain('owner@abc.com');
  });

  test('falls back to "your email" when opened directly', async () => {
    expect(allText(await renderScreen())).toContain('your email');
  });

  test('an incomplete code shows an error and does not continue', async () => {
    const root = await renderScreen();

    await typeInBox(root, 0, '123');
    await press(findText(root, 'Verify code'));

    expect(allText(root)).toContain('Enter the ');
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  test('a complete code moves on to set a new password', async () => {
    const root = await renderScreen(PHONE);

    await typeInBox(root, 0, '123456');
    await press(findText(root, 'Verify code'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ResetPassword');
  });

  test('resend clears the code and confirms it was sent', async () => {
    const root = await renderScreen();

    await typeInBox(root, 0, '12');
    await press(findText(root, 'Resend code'));

    expect(allText(root)).toContain('A new code is on its way.');
    expect(digitBoxes(root).map(box => box.props.value)).toEqual([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  });

  test('"Back" and "Use a different email" return to the email step', async () => {
    const root = await renderScreen();

    await press(findText(root, 'Back'));
    await press(findText(root, 'Use a different email'));

    expect(mockNavigation.popTo).toHaveBeenCalledTimes(2);
    expect(mockNavigation.popTo).toHaveBeenCalledWith('ForgotPassword');
  });
});

describe('ResetPasswordScreen', () => {
  test('has no back link', async () => {
    const root = await render(<ResetPasswordScreen />, PHONE);
    expect(allText(root)).not.toContain('Back');
  });

  test('weak or mismatched passwords show errors and stay put', async () => {
    const root = await render(<ResetPasswordScreen />, WIDE);

    await type(root, 'Create a new password', 'short');
    await type(root, 'Re-enter new password', 'other');
    await press(findText(root, 'Confirm new password'));

    expect(allText(root)).toContain('Password does not meet the rules below');
    expect(allText(root)).toContain('Passwords do not match');
    expect(mockParent.popTo).not.toHaveBeenCalled();
  });

  test('a valid new password returns to Login', async () => {
    const root = await render(<ResetPasswordScreen />, WIDE);

    await type(root, 'Create a new password', 'newpass123');
    await type(root, 'Re-enter new password', 'newpass123');
    await press(findText(root, 'Confirm new password'));

    expect(mockParent.popTo).toHaveBeenCalledWith('Login');
  });
});

describe('CodeInput', () => {
  function Harness({ initial = '' }: { initial?: string }) {
    const [code, setCode] = useState(initial);
    return (
      <>
        <CodeInput value={code} onChange={setCode} />
        <RN.Text testID="code">{code}</RN.Text>
      </>
    );
  }
  const codeOf = (root: ReactTestInstance) =>
    root.findByProps({ testID: 'code' }).props.children;

  test('typing a digit fills the box and ignores non-digits', async () => {
    const root = await render(<Harness />, WIDE);

    await typeInBox(root, 0, '7');
    await typeInBox(root, 1, 'a');

    expect(codeOf(root)).toBe('7');
  });

  test('pasting spreads digits from the box onwards and caps at 6', async () => {
    const root = await render(<Harness initial="12" />, WIDE);

    await typeInBox(root, 2, '3456789');

    expect(codeOf(root)).toBe('123456');
  });

  test('clearing a box drops it and everything after it', async () => {
    const root = await render(<Harness initial="123456" />, WIDE);

    await typeInBox(root, 3, '');

    expect(codeOf(root)).toBe('123');
  });

  test('Backspace on an empty box removes the previous digit', async () => {
    const root = await render(<Harness initial="12" />, WIDE);

    await ReactTestRenderer.act(() => {
      digitBoxes(root)[2].props.onKeyPress({
        nativeEvent: { key: 'Backspace' },
      });
    });

    expect(codeOf(root)).toBe('1');
  });

  test('each box is labelled for screen readers', async () => {
    const root = await render(<Harness />, WIDE);
    expect(digitBoxes(root).map(box => box.props.accessibilityLabel)).toEqual(
      [1, 2, 3, 4, 5, 6].map(n => `Digit ${n} of 6`),
    );
  });
});
