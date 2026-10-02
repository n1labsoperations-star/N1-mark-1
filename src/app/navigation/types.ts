import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AuthStackParamList } from '../../features/auth/types';
import type { AdminDrawerParamList } from '../../features/dashboard/types';
import type { JobsStackParamList } from '../../features/jobs/types';

// Bottom tabs for the non-admin roles. Every tab any role can have is listed
// here; each role picks its own subset in userTabs.ts.
export type UserTabParamList = {
  Jobs: undefined;
  Profile: undefined;
};

// Each non-admin role: its tabs, with Edit Profile and the role's own
// screens (e.g. the Supervisor's job import flow) opening over them.
export type RoleStackParamList = {
  Tabs: NavigatorScreenParams<UserTabParamList>;
  EditProfile: undefined;
} & JobsStackParamList;

// Dashboard stack (nested inside the root "Dashboard" screen)
export type MainStackParamList = {
  Admin: NavigatorScreenParams<AdminDrawerParamList>;
  Supervisor: NavigatorScreenParams<RoleStackParamList>;
  Operator: NavigatorScreenParams<RoleStackParamList>;
  Qc: NavigatorScreenParams<RoleStackParamList>;
};

// Root stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Dashboard: NavigatorScreenParams<MainStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
