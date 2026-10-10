import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthMobileShell from '../components/AuthMobileShell';
import AuthPrompt from '../components/AuthPrompt';
import LoginForm from '../components/LoginForm';
import { INVALID_CREDENTIALS_MESSAGE } from '../constants';
import { useAuthSession } from '../hooks';
import { findMockUser } from '../utils';

function LoginScreen() {
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();
  const { signIn } = useAuthSession();

  const [error, setError] = useState<string>();

  // No auth API yet: check against the mock users.
  const handleSubmit = (email: string, password: string) => {
    const user = findMockUser(email, password);
    if (!user) {
      setError(INVALID_CREDENTIALS_MESSAGE);
      return;
    }
    setError(undefined);
    // The root navigator swaps the login screens for this role's area.
    signIn(user.role);
  };

  const goToCreateOrganization = () =>
    navigation.navigate('Auth', { screen: 'CreateOrganization' });

  const goToForgotPassword = () =>
    navigation.navigate('Auth', {
      screen: 'ForgotPasswordFlow',
      params: { screen: 'ForgotPassword' },
    });

  if (isCompact) {
    return (
      <AuthMobileShell
        title="Welcome back"
        subtitle="Log in to manage your organization and team."
        footer={
          <AuthPrompt
            question="No account yet?"
            action="Create organization"
            onPress={goToCreateOrganization}
          />
        }
      >
        <LoginForm
          errorText={error}
          onSubmit={handleSubmit}
          onForgotPassword={goToForgotPassword}
        />
      </AuthMobileShell>
    );
  }

  return (
    <AuthLayout
      footer={
        <AuthPrompt
          question="Setting up for your company?"
          action="Create organization"
          onPress={goToCreateOrganization}
        />
      }
    >
      <LoginForm
        title="Get Started"
        subtitle="Log in as a user or admin to view your dashboard."
        showBrand
        showRememberMe
        errorText={error}
        onSubmit={handleSubmit}
        onForgotPassword={goToForgotPassword}
      />
    </AuthLayout>
  );
}

export default React.memo(LoginScreen);
