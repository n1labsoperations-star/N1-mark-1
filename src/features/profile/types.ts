import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ActivityEntry, ISODateString } from '../../shared/types';
import type { UserRole } from '../auth/constants';

export type Organization = {
  id: string;
  name: string;
  /** Used where space is tight, e.g. the phone top bar. */
  shortName: string;
  code: string;
};

/** The signed-in person. Will come from the auth session once login lands. */
export type MyProfile = {
  id: string;
  name: string;
  email: string;
  designation: string;
  phone: string;
  role: 'admin' | 'user';
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
