import React from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigation, useAuthSession } from '../../features/auth';
import MainStackNavigation from './MainStackNavigation';
import type { RootStackParamList } from './types';
import { linking } from './linking';
import { fontFamily } from '../../theme/fonts';

// Headers, tab labels and drawer items read their fonts from the theme.
const theme: Theme = {
  ...DefaultTheme,
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: 'normal' },
    medium: { fontFamily: fontFamily.semiBold, fontWeight: 'normal' },
    bold: { fontFamily: fontFamily.bold, fontWeight: 'normal' },
    heavy: { fontFamily: fontFamily.bold, fontWeight: 'normal' },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Signed out: only the login screens exist. Signed in: only the dashboard
 * area (for that role). Signing in or out swaps them, so neither is left in
 * the history for Back to return to.
 */
function RootNavigator() {
  const { role } = useAuthSession();
  return (
    <NavigationContainer theme={theme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role ? (
          <Stack.Screen name="Dashboard" component={MainStackNavigation} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigation} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default React.memo(RootNavigator);
