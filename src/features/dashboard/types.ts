import type { N1IconName } from '../../shared/components';

// Screens in the admin sidebar / drawer.
export type AdminDrawerParamList = {
  Overview: undefined;
  Users: undefined;
  Customers: undefined;
  Orders: undefined;
  JobCards: undefined;
  Machines: undefined;
  Billing: undefined;
};

export type AdminRoute = keyof AdminDrawerParamList;

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
