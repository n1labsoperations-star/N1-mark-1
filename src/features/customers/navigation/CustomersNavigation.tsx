import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerDetailsScreen } from '../screens/CustomerDetailsScreen';
import { CustomersListScreen } from '../screens/CustomersListScreen';
import type { CustomersStackParamList } from '../types';

const Stack = createNativeStackNavigator<CustomersStackParamList>();

// Nested inside the admin drawer's "Customers" item, which already draws the
// top bar, so the stack hides its own header.
function CustomersNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomersList" component={CustomersListScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(CustomersNavigation);
