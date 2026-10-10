// Public API of the Dashboard feature.
export { DashboardScreen } from './screens/DashboardScreen';
export { default as DashboardNavigation } from './navigation/DashboardNavigation';
export { default as Sidebar } from './components/Sidebar';
export { default as TopBar } from './components/TopBar';
export { MENU_ITEMS } from './constants';
export { useTopBarAction } from './hooks/useTopBarAction';
export type {
  AdminDrawerExtraOptions,
  TopBarAction,
  AdminDrawerParamList,
  AdminRoute,
  DashboardStackParamList,
} from './types';
