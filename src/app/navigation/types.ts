import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AuthStackParamList } from '../../features/auth/types';
import type { AdminDrawerParamList } from '../../features/dashboard/types';
import type { AdminStackParamList } from './admin/types';

// Material top tabs (nested inside the Feed bottom tab)
export type FeedTopTabParamList = {
  Latest: undefined;
  Popular: undefined;
};

// Bottom tabs (nested inside the Home drawer item)
export type BottomTabParamList = {
  Feed: NavigatorScreenParams<FeedTopTabParamList>;
  Search: undefined;
  Profile: undefined;
};

// Drawer (nested inside the Main stack screen)
export type DrawerParamList = {
  Home: NavigatorScreenParams<BottomTabParamList>;
  Settings: undefined;
};

// Dashboard stack (nested inside the root "Dashboard" screen)
export type MainStackParamList = {
  Admin: NavigatorScreenParams<AdminDrawerParamList>;
  User: undefined;
};

// Root stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Dashboard: NavigatorScreenParams<MainStackParamList>;
  Details: { id: string };
  Components: undefined;
  /** Admin module; will sit behind the login flow. */
  Admin: NavigatorScreenParams<AdminStackParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
