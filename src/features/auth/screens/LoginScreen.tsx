import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import LoginForm from '../components/LoginForm';
import { LOGIN_TAGLINE } from '../constants';

function LoginScreen() {
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();

  // No auth API yet: go straight in. reset replaces the whole history with the
  // Dashboard, so there is nothing to go back to.
  const handleSubmit = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });

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
