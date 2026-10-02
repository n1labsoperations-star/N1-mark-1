import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BillingScreen } from '../screens/BillingScreen';
import { InvoiceDetailsScreen } from '../screens/InvoiceDetailsScreen';
import { InvoiceEditScreen } from '../screens/InvoiceEditScreen';
import { QuoteDetailsScreen } from '../screens/QuoteDetailsScreen';
import { QuoteFormScreen } from '../screens/QuoteFormScreen';
import type { BillingStackParamList } from '../types';

const Stack = createNativeStackNavigator<BillingStackParamList>();

// Nested inside the admin drawer's "Billing" item, which already draws the
// top bar, so the stack hides its own header.
function BillingNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BillingHome" component={BillingScreen} />
      <Stack.Screen name="InvoiceDetails" component={InvoiceDetailsScreen} />
      <Stack.Screen name="InvoiceEdit" component={InvoiceEditScreen} />
      <Stack.Screen name="QuoteDetails" component={QuoteDetailsScreen} />
      <Stack.Screen name="QuoteForm" component={QuoteFormScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(BillingNavigation);
