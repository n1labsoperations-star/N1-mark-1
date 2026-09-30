import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordProvider } from '../context/ForgotPasswordContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import type { ForgotPasswordStackParamList } from '../types';

const Stack = createNativeStackNavigator<ForgotPasswordStackParamList>();

/** Email → 6-digit code → new password. */
function ForgotPasswordNavigation() {
  return (
    <ForgotPasswordProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen
          name="VerifyCode"
          component={VerifyCodeScreen}
          options={{ title: 'Enter Code' }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ title: 'Set New Password' }}
        />
      </Stack.Navigator>
    </ForgotPasswordProvider>
  );
}

export default React.memo(ForgotPasswordNavigation);
