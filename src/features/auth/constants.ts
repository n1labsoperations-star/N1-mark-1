import type { N1DropDownOption } from '../../shared/components';

/** Shown on the hero panel of every auth screen (login, sign-up, reset). */
export const AUTH_TAGLINE =
  'N1 brings your organization, your team, and your data together in one simple workspace. Stay on top of daily operations, keep your team aligned, and get a clear view of your business from one dashboard.';

export const PASSWORD_MIN_LENGTH = 8;

/** Digits in the emailed verification code. */
export const VERIFICATION_CODE_LENGTH = 6;

/** Length of the auto-generated organization code. */
export const ORGANIZATION_CODE_LENGTH = 6;

export const INDUSTRY_OPTIONS: N1DropDownOption<string>[] = [
  { label: 'Metal Manufacturing', value: 'metal-manufacturing' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Plastics & Rubber', value: 'plastics-rubber' },
  { label: 'Textiles', value: 'textiles' },
  { label: 'Food & Beverage', value: 'food-beverage' },
  { label: 'Other', value: 'other' },
];

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  QC: 'qc',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.OPERATOR]: 'Operator',
  [USER_ROLES.QC]: 'QC',
};

/**
 * Dashboard stack screen each role lands on after login: Admin gets the
 * dashboard; the others get the shop-floor app (jobs and scanning).
 */
export const ROLE_HOME = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.OPERATOR]: 'Operator',
  [USER_ROLES.QC]: 'Qc',
} as const satisfies Record<UserRole, string>;

export type MockUser = {
  email: string;
  /** 10-digit mobile number; logging in with it works like the email. */
  phone: string;
  password: string;
  role: UserRole;
};

/** Hardcoded logins until the auth API exists. */
export const MOCK_USERS: MockUser[] = [
  {
    email: 'admin@n1.com',
    phone: '9000000001',
    password: 'Admin@123',
    role: USER_ROLES.ADMIN,
  },
  {
    email: 'supervisor@n1.com',
    phone: '9000000002',
    password: 'Supervisor@123',
    role: USER_ROLES.SUPERVISOR,
  },
  {
    email: 'operator@n1.com',
    phone: '9000000003',
    password: 'Operator@123',
    role: USER_ROLES.OPERATOR,
  },
  {
    email: 'qc@n1.com',
    phone: '9000000004',
    password: 'Qc@12345',
    role: USER_ROLES.QC,
  },
];

export const INVALID_CREDENTIALS_MESSAGE =
  'Invalid email, phone number or password.';
