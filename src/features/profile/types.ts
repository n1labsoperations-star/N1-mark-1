import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ActivityEntry, ISODateString } from '../../shared/types';

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
