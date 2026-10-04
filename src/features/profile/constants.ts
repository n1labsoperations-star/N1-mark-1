import type { N1DropDownOption } from '../../shared/components';
import { ROLE_LABELS } from '../auth/constants';
import type { EmployeeRole } from './types';

export const PROFILE_STRINGS = {
  title: 'My profile',
  addressTitle: 'Address',
  tabs: {
    account: 'Account settings',
    security: 'Security',
  },
  changePhoto: 'Change photo',
  emailHelp: 'Your sign-in email. Contact support to change it.',
  logout: 'Log out',
  editProfile: 'Edit profile',
  edit: 'Edit',
  email: 'Email',
  phone: 'Phone number',
  organization: 'Organization',
  organizationCode: 'Organization code',
  memberSince: 'Member since',
  active: 'Active',
  fields: {
    name: 'Full name',
    designation: 'Designation',
    phone: 'Phone number',
    phonePlaceholder: 'e.g. +91 98765 43210',
  },
  passwordTitle: 'Change password',
  passwordSubtitle: 'Choose a new password for your account.',
  logoutTitle: 'Log out?',
  logoutMessage: 'You’ll need to sign in again to use N1.',
} as const;

export const EMPLOYEE_PROFILE_STRINGS = {
  title: 'Profile',
  editTitle: 'Edit Profile',
  editProfile: 'Edit profile',
  changePhoto: 'Change photo',
  logout: 'Log out',
  logoutTitle: 'Log out?',
  logoutMessage: 'You’ll need to sign in again to use N1.',
  employeeId: 'Employee ID',
  department: 'Department',
  shift: 'Shift',
  joined: 'Joined',
  phone: 'Phone',
  email: 'Email',
  fields: {
    name: 'Full name',
    role: 'Role',
    department: 'Department',
    shift: 'Shift',
    phone: 'Phone',
    email: 'Email',
  },
} as const;

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  supervisor: ROLE_LABELS.supervisor,
  operator: ROLE_LABELS.operator,
  qc: ROLE_LABELS.qc,
};

export const DEPARTMENT_OPTIONS: N1DropDownOption<string>[] = [
  'Machining',
  'Quality Control',
  'Production',
  'Maintenance',
  'Stores',
].map(name => ({ label: name, value: name }));

export const SHIFT_OPTIONS: N1DropDownOption<string>[] = [
  'Morning (6 AM – 2 PM)',
  'Afternoon (2 PM – 10 PM)',
  'Night (10 PM – 6 AM)',
  'General (9 AM – 6 PM)',
].map(name => ({ label: name, value: name }));
