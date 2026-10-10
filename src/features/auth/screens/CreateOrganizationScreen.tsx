import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useN1Breakpoint, useN1Styles } from '../../../shared/components';
import AuthLayout from '../components/AuthLayout';
import AuthPrompt from '../components/AuthPrompt';
import CreateOrganizationForm, {
  type CreateOrganizationValues,
} from '../components/CreateOrganizationForm';
import { useAppDispatch } from '../../../app/store/hooks';
import { profileActions } from '../../profile/store/profileSlice';
import { USER_ROLES } from '../constants';
import { useAuthSession } from '../hooks';
import { makeAuthLayoutStyles } from '../styles';

function CreateOrganizationScreen() {
  const styles = useN1Styles(makeAuthLayoutStyles);
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

  const loginPrompt = (
    <AuthPrompt
      question="Already have an account?"
      action="Log in"
      onPress={goToLogin}
    />
  );

  // Phones: the form pins its own header and button, so it skips the
  // scrolling auth layout.
  if (isCompact) {
    return (
      <SafeAreaView style={styles.compactSafeArea}>
        <CreateOrganizationForm
          compact
          footer={loginPrompt}
          onBack={goToLogin}
          onSubmit={handleSubmit}
        />
      </SafeAreaView>
    );
  }

  return (
    <AuthLayout wide footer={loginPrompt}>
      <CreateOrganizationForm
        compact={false}
        onBack={goToLogin}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

export default React.memo(CreateOrganizationScreen);
