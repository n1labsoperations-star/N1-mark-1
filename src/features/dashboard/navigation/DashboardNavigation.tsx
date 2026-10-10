import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobCardDetailsScreen } from '../../jobCards/screens/JobCardDetailsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import type { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

// Nested inside the admin drawer's "Overview" item, which already draws the
// top bar, so the stack hides its own header.
function DashboardNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      {/* The same job card screen as in Job Cards, pushed here so Back
          returns to this stack's screen below it. */}
      <Stack.Screen
        name="JobCardDetails"
        component={JobCardDetailsScreen as React.ComponentType<any>}
      />
    </Stack.Navigator>
  );
}

export default React.memo(DashboardNavigation);
