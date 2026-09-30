import type { AdminNavItem } from '../../../shared/components';
import { NAV_STRINGS } from '../../../shared/constants';
import type { AdminRouteName } from './types';

/** Top-level admin modules, in sidebar order. */
export type AdminSection =
  | 'Dashboard'
  | 'Users'
  | 'Customers'
  | 'Orders'
  | 'JobCards'
  | 'Machines'
  | 'Billing';

export const ADMIN_NAV_ITEMS: readonly AdminNavItem<AdminSection>[] = [
  { key: 'Dashboard', label: NAV_STRINGS.dashboard, icon: 'dashboard' },
  { key: 'Users', label: NAV_STRINGS.users, icon: 'users' },
  { key: 'Customers', label: NAV_STRINGS.customers, icon: 'building' },
  { key: 'Orders', label: NAV_STRINGS.orders, icon: 'package' },
  { key: 'JobCards', label: NAV_STRINGS.jobCards, icon: 'clipboard' },
  { key: 'Machines', label: NAV_STRINGS.machines, icon: 'wrench' },
  { key: 'Billing', label: NAV_STRINGS.billing, icon: 'receipt' },
];

/** Which sidebar item is highlighted on each screen (none for My profile). */
export const ROUTE_SECTION: Record<AdminRouteName, AdminSection | undefined> = {
  Dashboard: 'Dashboard',
  Users: 'Users',
  UserDetails: 'Users',
  MyProfile: undefined,
  Customers: 'Customers',
  CustomerDetails: 'Customers',
  Orders: 'Orders',
  OrderDetails: 'Orders',
  OrderForm: 'Orders',
  JobCards: 'JobCards',
  Machines: 'Machines',
  Billing: 'Billing',
  InvoiceDetails: 'Billing',
  InvoiceEdit: 'Billing',
  QuoteDetails: 'Billing',
  QuoteForm: 'Billing',
};

/** Module home screens show the phone menu bar; the rest draw a back header. */
export const isSectionRoot = (route: AdminRouteName) =>
  ADMIN_NAV_ITEMS.some(item => item.key === route);
