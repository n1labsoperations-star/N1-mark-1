import type { JobCard } from '../jobCards';
import type { CustomerShare } from '../customers';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { N1IconName } from '../../shared/components';
import type { BillingStackParamList } from '../billing/types';
import type { CustomersStackParamList } from '../customers/types';
import type { JobCardsStackParamList } from '../jobCards/types';
import type { MachinesStackParamList } from '../machines/types';
import type { OrdersStackParamList } from '../orders/types';
import type { ProfileStackParamList } from '../profile/types';
import type { UserManagementStackParamList } from '../userManagement/types';

// Screens in the admin sidebar / drawer.
export type AdminDrawerParamList = {
  Overview: undefined;
  Users: NavigatorScreenParams<UserManagementStackParamList> | undefined;
  Customers: NavigatorScreenParams<CustomersStackParamList> | undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList> | undefined;
  JobCards: NavigatorScreenParams<JobCardsStackParamList> | undefined;
  Machines: NavigatorScreenParams<MachinesStackParamList> | undefined;
  Billing: NavigatorScreenParams<BillingStackParamList> | undefined;
  /** Not in the menu; opened from the signed-in user in the top bar. */
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
  /** Not in the menu; opened from the organization name in the top bar. */
  Organization: undefined;
};

// Stack nested inside the drawer's "Overview" item.
export type DashboardStackParamList = {
  DashboardHome: undefined;
};

/** Drawer items listed in the sidebar menu. */
export type AdminRoute = Exclude<
  keyof AdminDrawerParamList,
  'Profile' | 'Organization'
>;

export type MenuItem = {
  route: AdminRoute;
  label: string;
  icon: N1IconName;
  /** Listed in the phone drawer too (the design shows a shorter phone menu). */
  onCompact: boolean;
};

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'invited' | 'suspended';

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** ISO date, e.g. "2026-09-12". */
  joined: string;
};

/** Time range picked in the dashboard header. */
export type DashboardPeriod = 'week' | 'month' | 'year';

/** The dashboard summary cards for one period. */
export type PeriodSummary = {
  billed: number;
  outstanding: number;
  orders: number;
};

/** One row of the dashboard's customers table. */
export type CustomerRow = CustomerShare & {
  /** The customer's work orders not yet completed. */
  pendingDelivery: number;
};

/** A priority job: the job card plus its work order's route card number. */
export type PriorityJob = JobCard & { routeCardNo: string };
