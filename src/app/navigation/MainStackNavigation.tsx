import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { DashboardNavigation } from '../../features/dashboard';
import type { MainStackParamList } from './types';

// Placeholder until the real User dashboard exists.
const UserScreen = React.memo(function UserScreenComponent() {
  return (
    <View>
      <Text>heloo Screen</Text>
    </View>
  );
});
UserScreen.displayName = 'UserScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Nested inside the root stack's "Dashboard" screen, so it must not create
// its own NavigationContainer.
function MainStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Admin" component={DashboardNavigation} />
      <Stack.Screen name="User" component={UserScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(MainStackNavigation);
