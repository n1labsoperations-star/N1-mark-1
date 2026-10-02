import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useN1Breakpoint } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import CreateOrganizationForm, {
  type CreateOrganizationValues,
} from '../components/CreateOrganizationForm';
import { useAppDispatch } from '../../../app/store/hooks';
import { profileActions } from '../../profile/store/profileSlice';
import { USER_ROLES } from '../constants';
import { useAuthSession } from '../hooks';

function CreateOrganizationScreen() {
  const { isCompact } = useN1Breakpoint();
  const navigation = useNavigation();
  const { signIn } = useAuthSession();
  const dispatch = useAppDispatch();

  // Opened straight from a link there is no Login behind this screen to go back to.
  const goToLogin = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  // Saves the organization (mock API), then the new admin goes straight in;
  // the root navigator swaps the sign-up screens for the dashboard.
  const handleSubmit = ({
    password: _password,
    ...organization
  }: CreateOrganizationValues) => {
    dispatch(profileActions.createOrganizationRequest(organization));
    signIn(USER_ROLES.ADMIN);
  };

  return (
    <AuthLayout
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
