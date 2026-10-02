import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserDetailsScreen } from '../screens/UserDetailsScreen';
import { UsersListScreen } from '../screens/UsersListScreen';
import type { UserManagementStackParamList } from '../types';

const Stack = createNativeStackNavigator<UserManagementStackParamList>();

// Nested inside the admin drawer's "Users" item, which already draws the
// top bar, so the stack hides its own header.
function UserManagementNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsersList" component={UsersListScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(UserManagementNavigation);
