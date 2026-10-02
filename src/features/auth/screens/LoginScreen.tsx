import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import LoginForm from '../components/LoginForm';
import {
  INVALID_CREDENTIALS_MESSAGE,
  LOGIN_TAGLINE,
  ROLE_HOME,
} from '../constants';
import { findMockUser } from '../utils';

function LoginScreen() {
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();

  const [error, setError] = useState<string>();

  // No auth API yet: check against the mock users. reset replaces the whole
  // history with the role's dashboard, so there is nothing to go back to.
  const handleSubmit = (email: string, password: string) => {
    const user = findMockUser(email, password);
    if (!user) {
      setError(INVALID_CREDENTIALS_MESSAGE);
      return;
    }
    setError(undefined);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Dashboard',
          params: { screen: ROLE_HOME[user.role] },
        },
      ],
    });
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
