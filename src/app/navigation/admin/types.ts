import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

/**
 * Admin module routes. The stack is self-contained so it can be mounted
 * behind the login flow later (see AdminNavigator).
 */
export type AdminStackParamList = {
  Dashboard: undefined;
  Users: undefined;
  UserDetails: { userId: string };
  MyProfile: undefined;
  Customers: undefined;
  CustomerDetails: { customerId: string };
  Orders: undefined;
  OrderDetails: { orderId: string };
  /** Without an id the form creates a new order. */
  OrderForm: { orderId?: string } | undefined;
  JobCards: undefined;
  Machines: undefined;
  Billing: { tab?: 'invoices' | 'quotes' } | undefined;
  InvoiceDetails: { invoiceId: string };
  InvoiceEdit: { invoiceId: string };
  QuoteDetails: { quoteId: string };
  /** Without an id the form creates a new quote. */
  QuoteForm: { quoteId?: string } | undefined;
};

export type AdminRouteName = keyof AdminStackParamList;

export type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export type AdminScreenProps<R extends AdminRouteName> = NativeStackScreenProps<
  AdminStackParamList,
  R
>;
