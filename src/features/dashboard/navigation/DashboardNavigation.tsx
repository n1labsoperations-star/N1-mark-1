import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

// Nested inside the admin drawer's "Overview" item, which already draws the
// top bar, so the stack hides its own header.
function DashboardNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(DashboardNavigation);
