import type { ComponentProps } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CustomerDetailsScreen,
  CustomersListScreen,
} from '../../../features/customers';
import {
  BillingScreen,
  InvoiceDetailsScreen,
  InvoiceEditScreen,
  QuoteDetailsScreen,
  QuoteFormScreen,
} from '../../../features/billing';
import { DashboardScreen } from '../../../features/dashboard';
import { JobCardsScreen } from '../../../features/jobCards';
import { MachinesListScreen } from '../../../features/machines';
import {
  OrderDetailsScreen,
  OrderFormScreen,
  OrdersListScreen,
} from '../../../features/orders';
import { MyProfileScreen } from '../../../features/profile';
import {
  UserDetailsScreen,
  UsersListScreen,
} from '../../../features/userManagement';
import { AdminShell } from './AdminShell';
import type { AdminSection } from './navItems';
import type { AdminRouteName, AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

type LayoutProps = Parameters<
  NonNullable<ComponentProps<typeof Stack.Navigator>['layout']>
>[0];

/** Wraps every admin screen in the shell; the sidebar follows the focused route. */
function AdminStackLayout({ children, state, navigation }: LayoutProps) {
  return (
    <AdminShell
      routeName={state.routes[state.index].name}
      // Switching module starts a fresh history, so Back never jumps between modules.
      onNavigateSection={(section: AdminSection) =>
        navigation.reset({ index: 0, routes: [{ name: section }] })
      }
      onOpenProfile={() => navigation.navigate('MyProfile')}
    >
      {children}
    </AdminShell>
  );
}

/**
 * Every admin screen, wrapped in the sidebar / top bar shell. Mount it behind
 * the login flow; `initialRouteName` lets the caller pick the landing screen.
 */
export function AdminNavigator({
  initialRouteName = 'Dashboard',
}: {
  initialRouteName?: AdminRouteName;
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
      layout={AdminStackLayout}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Users" component={UsersListScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="Customers" component={CustomersListScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
      <Stack.Screen name="Orders" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen} />
      <Stack.Screen name="JobCards" component={JobCardsScreen} />
      <Stack.Screen name="Machines" component={MachinesListScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="InvoiceDetails" component={InvoiceDetailsScreen} />
      <Stack.Screen name="InvoiceEdit" component={InvoiceEditScreen} />
      <Stack.Screen name="QuoteDetails" component={QuoteDetailsScreen} />
      <Stack.Screen name="QuoteForm" component={QuoteFormScreen} />
    </Stack.Navigator>
  );
}
