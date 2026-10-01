import type {
  ActivityEntry,
  Attachment,
  ISODateString,
} from '../../shared/types';

export type UserRole = 'admin' | 'user';
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
