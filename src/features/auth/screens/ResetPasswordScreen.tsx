import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { N1Button, N1Checklist, N1TextInput } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthStep from '../components/AuthStep';
import { RESET_PASSWORD_TAGLINE } from '../constants';
import type {
  AuthStackParamList,
  ForgotPasswordStackParamList,
} from '../types';
import { checkPassword, isPasswordValid, passwordChecklist } from '../utils';

function ResetPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ForgotPasswordStackParamList>>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const rules = checkPassword(password, confirmPassword);

  // No API yet: finish the flow and return to Login.
  const handleConfirm = () => {
    setSubmitted(true);
    if (!isPasswordValid(rules)) {
      return;
    }
    navigation
      .getParent<NativeStackNavigationProp<AuthStackParamList>>()
      ?.popTo('Login');
  };

  return (
    <AuthLayout tagline={RESET_PASSWORD_TAGLINE}>
      <AuthStep
        icon="lock-open"
        iconTone="success"
        title="Set New Password"
        subtitle="Code verified. Choose a new password for your account."
      >
        <N1TextInput
          label="New password"
          secure
          value={password}
          onChangeText={setPassword}
          placeholder="Create a new password"
          autoComplete="new-password"
          textContentType="newPassword"
          errorText={
            submitted && !(rules.minLength && rules.lettersAndNumbers)
              ? 'Password does not meet the rules below'
              : undefined
          }
        />
        <N1TextInput
          label="Confirm password"
          secure
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          textContentType="newPassword"
          errorText={
            submitted && !rules.matches ? 'Passwords do not match' : undefined
          }
        />
        <N1Checklist items={passwordChecklist(rules)} />
        <N1Button
          title="Confirm new password"
          size="lg"
          fullWidth
          onPress={handleConfirm}
        />
      </AuthStep>
    </AuthLayout>
  );
}

export default React.memo(ResetPasswordScreen);
