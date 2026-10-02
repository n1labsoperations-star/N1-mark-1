import type { N1DropDownOption } from '../../shared/components';
import type { EmployeeRole } from './types';

export const PROFILE_STRINGS = {
  title: 'My profile',
  signedInAs: 'Signed in as the account owner',
  logout: 'Log out',
  editProfile: 'Edit profile',
  edit: 'Edit',
  changePassword: 'Change password',
  password: 'Password',
  contact: 'Contact details',
  email: 'Email',
  phone: 'Phone number',
  designation: 'Designation',
  organization: 'Organization',
  role: 'Role',
  status: 'Status',
  memberSince: 'Member since',
  admin: 'Admin',
  user: 'User',
  active: 'Active',
  editTitle: 'Edit profile',
  editSubtitle: 'Update how you appear to your team.',
  fields: {
    name: 'Full name',
    designation: 'Designation',
    phone: 'Phone number',
    phonePlaceholder: 'e.g. +91 98765 43210',
    currentPassword: 'Current password',
    currentPasswordPlaceholder: 'Enter your current password',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Create a new password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter new password',
  },
  passwordTitle: 'Change password',
  passwordSubtitle: 'Choose a new password for your account.',
  passwordSubmit: 'Update password',
  passwordRulesUnmet: 'The new password doesn’t meet the rules below',
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
  'second-admin': 'Second Admin',
  'machine-operator': 'Machine Operator',
  qc: 'QC',
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
