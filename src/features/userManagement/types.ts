import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {
  ActivityEntry,
  Attachment,
  ISODateString,
} from '../../shared/types';

import type { UserRole } from '../auth/constants';

/** Admin uses the dashboard; Supervisor, Operator and QC use the shop-floor app. */
export type { UserRole };
export type UserStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export type UserPermissionKey = 'viewOrders' | 'manageUsers' | 'exportReports';
export type UserPermissions = Record<UserPermissionKey, boolean>;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  designation: string;
  phone: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: ISODateString;
  permissions: UserPermissions;
  attachments: Attachment[];
  activity: ActivityEntry[];
};

/** What the Create / Edit user form sends. Password is write-only. */
export type UserInput = {
  name: string;
  designation: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** Blank on edit keeps the current password. */
  password?: string;
  phone?: string;
  department?: string;
  permissions?: UserPermissions;
};

export type UserFilters = {
  role: UserRole | 'all';
  status: UserStatus | 'all';
};

// Stack nested inside the admin drawer's "Users" item.
export type UserManagementStackParamList = {
  UsersList: undefined;
  UserDetails: { userId: string };
};

export type UserManagementNavigation =
  NativeStackNavigationProp<UserManagementStackParamList>;

export type UserManagementScreenProps<
  R extends keyof UserManagementStackParamList,
> = NativeStackScreenProps<UserManagementStackParamList, R>;
