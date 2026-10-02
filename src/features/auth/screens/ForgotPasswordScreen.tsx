import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { N1Button, N1TextInput } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthStep from '../components/AuthStep';
import { FORGOT_PASSWORD_TAGLINE } from '../constants';
import { useForgotPassword } from '../context/ForgotPasswordContext';
import type {
  AuthStackParamList,
  ForgotPasswordStackParamList,
} from '../types';
import { isValidEmail } from '../utils';

function ForgotPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ForgotPasswordStackParamList>>();
  const { email: savedEmail, setEmail: saveEmail } = useForgotPassword();
  // Pre-filled when the user comes back via "Use a different email".
  const [email, setEmail] = useState(savedEmail);
  const [submitted, setSubmitted] = useState(false);
  const valid = isValidEmail(email);

  // popTo also works when this screen was opened straight from a link.
  const backToLogin = () =>
    navigation
      .getParent<NativeStackNavigationProp<AuthStackParamList>>()
      ?.popTo('Login');

  // No API yet: pretend the code was sent and move on.
  const handleSendCode = () => {
    setSubmitted(true);
    if (!valid) {
      return;
    }
    saveEmail(email.trim());
    navigation.navigate('VerifyCode');
  };

  return (
    <AuthLayout tagline={FORGOT_PASSWORD_TAGLINE}>
      <AuthStep
        icon="lock"
        title="Forgot Password?"
        subtitle="Enter the email you use to log in and we'll send a 6-digit code to verify it's you."
        backLabel="Back to log in"
        onBack={backToLogin}
      >
        <N1TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          errorText={submitted && !valid ? 'Enter a valid email' : undefined}
          onSubmitEditing={handleSendCode}
        />
        <N1Button
          title="Send code"
          size="lg"
          fullWidth
          onPress={handleSendCode}
        />
      </AuthStep>
    </AuthLayout>
  );
}

export default React.memo(ForgotPasswordScreen);
