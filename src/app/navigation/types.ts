import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AuthStackParamList } from '../../features/auth/types';
import type { AdminDrawerParamList } from '../../features/dashboard/types';

// Dashboard stack (nested inside the root "Dashboard" screen)
export type MainStackParamList = {
  Admin: NavigatorScreenParams<AdminDrawerParamList>;
  User: undefined;
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
