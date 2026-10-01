import React from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigation } from '../../features/auth';
import MainStackNavigation from './MainStackNavigation';
import { AdminNavigator } from './admin';
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

function RootNavigator() {
  return (
    <NavigationContainer theme={theme} linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="Auth"
          component={AuthNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={MainStackNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default React.memo(RootNavigator);
