import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import CreateOrganizationForm from '../components/CreateOrganizationForm';
import { CREATE_ORGANIZATION_TAGLINE } from '../constants';

function CreateOrganizationScreen() {
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();

  // Opened straight from a link there is no Login behind this screen to go back to.
  const goToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  // No API yet: the new admin goes straight in. reset replaces the whole
  // history with the Dashboard, so there is nothing to go back to.
  const handleSubmit = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });

  return (
    <AuthLayout
      tagline={CREATE_ORGANIZATION_TAGLINE}
      wide
      footer={
        <AuthPrompt
          question="Already have an account?"
          action="Log in"
          onPress={goToLogin}
        />
      }
    >
      <CreateOrganizationForm
        compact={isCompact}
        onBack={goToLogin}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

export default React.memo(CreateOrganizationScreen);
