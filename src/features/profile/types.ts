import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  ActivityEntry,
  Attachment,
  ISODateString,
} from '../../shared/types';
import type { UserRole } from '../auth/constants';

/** A configured GST rate (%). CGST / SGST / IGST are derived from it. */
export type TaxRate = {
  id: string;
  rate: number;
  active: boolean;
};

export type Organization = {
  id: string;
  /** Generated at sign-up; identifies the organization, never edited. */
  code: string;
  createdAt: ISODateString;
  /** Used where space is tight, e.g. the phone top bar. */
  shortName: string;

  // General
  name: string;
  logo: Attachment | null;
  phone: string;
  email: string;
  website: string;

  // Business details
  /** A BUSINESS_TYPE_OPTIONS value, e.g. "private-limited". */
  businessType: string;
  /** An INDUSTRY_OPTIONS value, e.g. "metal-manufacturing". */
  industry: string;
  /** e.g. CIN or Udyam registration number. */
  registrationDetails: string;

  // Address
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;

  // GST & tax
  gstRegistered: boolean;
  /** GSTIN, upper-case; blank when not registered. */
  gstNumber: string;
  /** State the GSTIN is registered in. */
  gstState: string;
  /** GST rates this organization bills at; inactive ones are kept for history. */
  taxRates: TaxRate[];
  /** Picked automatically on new quotes and invoices; an active rate. */
  defaultTaxRate: number | null;

  // Invoice settings
  invoicePrefix: string;
  invoiceStartNumber: number;
  /** A PAYMENT_TERMS_OPTIONS value, e.g. "net-30". */
  paymentTerms: string;
  invoiceFooter: string;

  // Document settings
  invoiceLogo: Attachment | null;
  termsAndConditions: string;
  signature: Attachment | null;
};

/** Everything Organization details can change (not the code or dates). */
export type OrganizationUpdate = Partial<
  Omit<Organization, 'id' | 'code' | 'createdAt' | 'shortName'>
>;

/** What Create organization collects (the password goes to auth only). */
export type OrganizationInput = Pick<
  Organization,
  'name' | 'code' | 'industry' | 'email' | 'phone' | 'gstNumber'
>;

/** The signed-in person. Will come from the auth session once login lands. */
export type MyProfile = {
  id: string;
  name: string;
  email: string;
  designation: string;
  phone: string;
  role: UserRole;
  status: 'active';
  memberSince: ISODateString;
  activity: ActivityEntry[];
};

export type ProfileInput = Pick<MyProfile, 'name' | 'designation' | 'phone'>;

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};

export type Session = { profile: MyProfile; organization: Organization };

// Stack nested inside the admin drawer's hidden "Profile" item.
export type ProfileStackParamList = {
  MyProfile: undefined;
};

export type ProfileScreenProps<R extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, R>;

/** Non-admin roles. Their tabs differ but they share the same profile screens. */
export type EmployeeRole = Exclude<UserRole, 'admin'>;

/** A non-admin signed-in person (Profile tab). */
export type EmployeeProfile = {
  id: string;
  name: string;
  role: EmployeeRole;
  employeeId: string;
  department: string;
  shift: string;
  joinedOn: ISODateString;
  phone: string;
  email: string;
};

export type EmployeeProfileInput = Pick<
  EmployeeProfile,
  'name' | 'department' | 'shift' | 'phone' | 'email'
>;

// Routes the employee profile screens navigate to. The role navigator that
// hosts them must register these names.
export type EmployeeProfileParamList = {
  EditProfile: undefined;
};
