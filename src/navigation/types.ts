import type { NavigatorScreenParams } from '@react-navigation/native';

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

// Root stack
export type RootStackParamList = {
  Main: NavigatorScreenParams<DrawerParamList>;
  Details: { id: string };
  Components: undefined;
  /** Admin module; will sit behind the login flow. */
  Admin: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
