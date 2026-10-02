import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrderFormScreen } from '../screens/OrderFormScreen';
import { OrdersListScreen } from '../screens/OrdersListScreen';
import type { OrdersStackParamList } from '../types';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

// Nested inside the admin drawer's "Orders" item, which already draws the
// top bar, so the stack hides its own header.
function OrdersNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(OrdersNavigation);
