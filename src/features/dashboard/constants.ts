import type { N1DropDownOption, N1Tone } from '../../shared/components';
import type { MenuItem, OrgUser, UserRole, UserStatus } from './types';

export const MENU_ITEMS: MenuItem[] = [
  { route: 'Overview', label: 'Dashboard', icon: 'dashboard', onCompact: true },
  { route: 'Users', label: 'Users', icon: 'users', onCompact: true },
  {
    route: 'Customers',
    label: 'Customers',
    icon: 'building',
    onCompact: false,
  },
  { route: 'Orders', label: 'Orders', icon: 'package', onCompact: true },
  {
    route: 'JobCards',
    label: 'Job Cards',
    icon: 'clipboard',
    onCompact: false,
  },
  { route: 'Machines', label: 'Machines', icon: 'wrench', onCompact: false },
  { route: 'Billing', label: 'Billing', icon: 'receipt', onCompact: false },
];

// Sample data until the API exists.
export const ORGANIZATION = {
  name: 'ABC Engineering Pvt Ltd',
  shortName: 'ABC Engineering',
};

export const CURRENT_USER = {
  name: 'Koushik Dasarathan',
  email: 'kousigaratchagan.pd@foodhub.com',
  roleLabel: 'Admin',
};

export const SAMPLE_USERS: OrgUser[] = [
  {
    id: '1',
    name: 'Koushik Dasarathan',
    email: 'kousigaratchagan.pd@foodhub.com',
    role: 'admin',
    status: 'active',
    joined: '2026-09-12',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@abcengineering.com',
    role: 'user',
    status: 'active',
    joined: '2026-09-18',
  },
  {
    id: '3',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@abcengineering.com',
    role: 'user',
    status: 'invited',
    joined: '2026-09-20',
  },
  {
    id: '4',
    name: 'Divya Rao',
    email: 'divya.rao@abcengineering.com',
    role: 'user',
    status: 'active',
    joined: '2026-09-22',
  },
  {
    id: '5',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@abcengineering.com',
    role: 'user',
    status: 'suspended',
    joined: '2026-09-24',
  },
];

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  user: 'User',
};
export const ROLE_TONE: Record<UserRole, N1Tone> = {
  admin: 'info',
  user: 'neutral',
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
};
export const STATUS_TONE: Record<UserStatus, N1Tone> = {
  active: 'success',
  invited: 'info',
  suspended: 'danger',
};

export const ALL = 'all';

export const ROLE_FILTER_OPTIONS: N1DropDownOption<string>[] = [
  { label: 'All roles', value: ALL },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

export const STATUS_FILTER_OPTIONS: N1DropDownOption<string>[] = [
  { label: 'All statuses', value: ALL },
  { label: 'Active', value: 'active' },
  { label: 'Invited', value: 'invited' },
  { label: 'Suspended', value: 'suspended' },
];

export const DASHBOARD_STRINGS = {
  title: 'Dashboard',
  subtitle: (org: string) => `Overview for ${org}.`,
  stats: {
    monthly: 'Monthly billed',
    year: 'Total billed (this year)',
    outstanding: 'Outstanding amount',
    newOrders: 'New orders',
  },
  distribution: {
    title: 'Customer order distribution',
    subtitle: 'Share of active orders by customer, by volume.',
    activeBadge: (n: number) => `${n} active orders`,
    activeBadgeShort: (n: number) => `${n} active`,
    pipeline: 'Active pipeline',
    orders: (n: number) => `${n} orders`,
    total: 'Total',
    ordersCaption: 'orders',
    columns: {
      customer: 'Customer',
      orders: 'Orders',
      billed: 'Total billed',
      outstanding: 'Outstanding',
    },
    billed: (amount: string) => `Billed: ${amount}`,
    outstanding: (amount: string) => `Outstanding: ${amount}`,
    viewMore: 'View more',
    open: (name: string) => `Open ${name}`,
  },
  jobs: {
    title: 'Priority jobs (by due date)',
    viewAll: (n: number) => `View all (${n})`,
    open: (title: string) => `Open ${title}`,
  },
} as const;

/** Rows in the priority jobs panel before "View all". */
export const PRIORITY_JOBS_LIMIT = 10;
