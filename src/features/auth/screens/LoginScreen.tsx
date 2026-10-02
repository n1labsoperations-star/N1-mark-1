import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import LoginForm from '../components/LoginForm';
import { INVALID_CREDENTIALS_MESSAGE, LOGIN_TAGLINE } from '../constants';
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

  return (
    <AuthLayout
      tagline={LOGIN_TAGLINE}
      footer={
        <AuthPrompt
          question="Setting up for your company?"
          action="Create organization"
          onPress={() =>
            navigation.navigate('Auth', { screen: 'CreateOrganization' })
          }
        />
      }
    >
      <LoginForm
        title={isCompact ? 'Welcome Back!' : 'Welcome to N1'}
        subtitle={isCompact ? 'Log in to your dashboard.' : undefined}
        showLogo={isCompact}
        showRememberMe={!isCompact}
        errorText={error}
        onSubmit={handleSubmit}
        onForgotPassword={() =>
          navigation.navigate('Auth', {
            screen: 'ForgotPasswordFlow',
            params: { screen: 'ForgotPassword' },
          })
        }
      />
    </AuthLayout>
  );
}

export default React.memo(LoginScreen);
