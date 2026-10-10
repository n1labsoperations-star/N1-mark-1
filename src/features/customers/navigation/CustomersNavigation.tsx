import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QuoteDetailsScreen } from '../../billing/screens/QuoteDetailsScreen';
import { JobCardDetailsScreen } from '../../jobCards/screens/JobCardDetailsScreen';
import { OrderDetailsScreen } from '../../orders/screens/OrderDetailsScreen';
import { OrderFormScreen } from '../../orders/screens/OrderFormScreen';
import { CustomerDetailsScreen } from '../screens/CustomerDetailsScreen';
import { CustomersListScreen } from '../screens/CustomersListScreen';
import type { CustomersStackParamList } from '../types';

const Stack = createNativeStackNavigator<CustomersStackParamList>();
/** Screens typed for another stack; this one carries the same params. */
type Any = React.ComponentType<any>;

// Nested inside the admin drawer's "Customers" item, which already draws the
// top bar, so the stack hides its own header.
function CustomersNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomersList" component={CustomersListScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
      {/* A customer's orders and quotes open here, so Back returns to the
          customer. Same screens as in Orders and Billing. */}
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen as Any} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen as Any} />
      <Stack.Screen
        name="JobCardDetails"
        component={JobCardDetailsScreen as Any}
      />
      <Stack.Screen name="QuoteDetails" component={QuoteDetailsScreen as Any} />
    </Stack.Navigator>
  );
}

export default React.memo(CustomersNavigation);
