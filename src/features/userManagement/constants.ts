import type { N1DropDownOption } from '../../shared/components';
import type { StatusMeta } from '../../shared/types';
import type {
  UserFilters,
  UserPermissionKey,
  UserRole,
  UserStatus,
} from './types';

export const USER_STRINGS = {
  title: 'Users',
  subtitle: (org: string) => `Manage everyone in ${org}.`,
  create: 'Create User',
  createTitle: 'Create user',
  createSubtitle: (org: string) => `Add a new person to ${org}.`,
  createSubmit: 'Create user',
  editTitle: 'Edit user',
  editSubtitle: 'Update this person’s details.',
  search: 'Search users',
  roleFilter: 'Role',
  statusFilter: 'Status',
  allRoles: 'All roles',
  noun: 'users',
  columns: {
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    joined: 'Joined',
  },
  fields: {
    name: 'Full name',
    namePlaceholder: 'e.g. Priya Sharma',
    designation: 'Designation',
    designationPlaceholder: 'e.g. Production Supervisor',
    email: 'Email',
    emailPlaceholder: 'e.g. priya.sharma@abcengineering.com',
    password: 'Password',
    passwordCreatePlaceholder: 'Set a password for this user',
    passwordEditPlaceholder: 'Leave blank to keep current password',
    passwordCreateHelp:
      'As an admin, you’re setting this person’s initial password. They can change it after signing in.',
    passwordEditHelp:
      'As an admin, you can reset this person’s password here. Leave blank to keep it unchanged.',
    passwordWeak: 'Use at least 8 characters with letters and numbers',
    role: 'Role',
    status: 'Status',
  },
  details: {
    title: 'User details',
    joined: (date: string) => `Joined ${date}`,
    markInactive: 'Mark as inactive',
    markActive: 'Mark as active',
    editDetails: 'Edit details',
    message: 'Message',
    resetPassword: 'Reset password',
    reset: 'Reset',
    contact: 'Contact details',
    email: 'Email',
    phone: 'Phone number',
    designation: 'Designation',
    department: 'Department',
    organization: 'Organization',
    joinedLabel: 'Joined',
    attachments: 'Attachments',
    permissions: 'Permissions',
    role: 'Role',
    status: 'Status',
    notFound: 'This user no longer exists.',
  },
  delete: {
    title: 'Delete user?',
    message: (name: string) =>
      [
        'This will permanently remove ',
        name,
        ' and their access. This can’t be undone.',
      ] as const,
    confirm: 'Delete user',
  },
  a11y: {
    edit: (name: string) => `Edit ${name}`,
    delete: (name: string) => `Delete ${name}`,
  },
} as const;

export const ROLE_META: Record<UserRole, StatusMeta> = {
  admin: { label: 'Admin', tone: 'info' },
  user: { label: 'User', tone: 'neutral' },
};

export const STATUS_META: Record<UserStatus, StatusMeta> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'danger' },
  inactive: { label: 'Inactive', tone: 'neutral' },
};

export const PERMISSION_LABELS: Record<UserPermissionKey, string> = {
  viewOrders: 'View orders',
  manageUsers: 'Manage users',
  exportReports: 'Export reports',
};

export const ROLE_OPTIONS: N1DropDownOption<UserRole>[] = (
  Object.keys(ROLE_META) as UserRole[]
).map(value => ({ value, label: ROLE_META[value].label }));

export const STATUS_OPTIONS: N1DropDownOption<UserStatus>[] = (
  Object.keys(STATUS_META) as UserStatus[]
).map(value => ({ value, label: STATUS_META[value].label }));

export const ROLE_FILTER_OPTIONS: N1DropDownOption<UserFilters['role']>[] = [
  { value: 'all', label: USER_STRINGS.allRoles },
  ...ROLE_OPTIONS,
];

export const STATUS_FILTER_OPTIONS: N1DropDownOption<UserFilters['status']>[] =
  [{ value: 'all', label: 'All statuses' }, ...STATUS_OPTIONS];

export const DEFAULT_PERMISSIONS: Record<
  UserRole,
  Record<UserPermissionKey, boolean>
> = {
  admin: { viewOrders: true, manageUsers: true, exportReports: true },
  user: { viewOrders: true, manageUsers: false, exportReports: false },
};
