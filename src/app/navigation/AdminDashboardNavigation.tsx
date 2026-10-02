import React, { useCallback, useState } from 'react';
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerHeaderProps,
} from '@react-navigation/drawer';
import {
  AdminScreen,
  ComingSoon,
  useN1Breakpoint,
  useN1Theme,
} from '../../shared/components';
import {
  DashboardNavigation,
  MENU_ITEMS,
  Sidebar,
  TopBar,
  type AdminDrawerParamList,
  type AdminRoute,
} from '../../features/dashboard';
import { BillingNavigation } from '../../features/billing';
import { CustomersNavigation } from '../../features/customers';
import { JobCardsNavigation } from '../../features/jobCards';
import { MachinesListScreen } from '../../features/machines';
import { OrdersNavigation } from '../../features/orders';
import { ProfileNavigation } from '../../features/profile';
import { UserManagementNavigation } from '../../features/userManagement';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const PLACEHOLDER_STRINGS = {
  title: 'Coming soon',
  message: 'This module will be available here shortly.',
} as const;

// Shown for modules that don't have a navigator in the drawer yet.
const PlaceholderScreen = React.memo(function PlaceholderScreenComponent() {
  return (
    <AdminScreen>
      <ComingSoon
        title={PLACEHOLDER_STRINGS.title}
        message={PLACEHOLDER_STRINGS.message}
      />
    </AdminScreen>
  );
});
PlaceholderScreen.displayName = 'PlaceholderScreen';

const screenFor = (route: AdminRoute) => {
  switch (route) {
    case 'Overview':
      return DashboardNavigation;
    case 'Users':
      return UserManagementNavigation;
    case 'Customers':
      return CustomersNavigation;
    case 'Orders':
      return OrdersNavigation;
    case 'Billing':
      return BillingNavigation;
    case 'JobCards':
      return JobCardsNavigation;
    case 'Machines':
      return MachinesListScreen;
    default:
      return PlaceholderScreen;
  }
};

/**
 * Admin shell. Wide screens: a permanent sidebar that can collapse to an icon
 * rail. Phones: the same menu as a slide-in drawer opened from the top bar.
 */
type Props = {
  /** Drawer item to open first. Defaults to the dashboard. */
  initialRouteName?: keyof AdminDrawerParamList;
};

function AdminDashboardNavigation({ initialRouteName = 'Overview' }: Props) {
  const theme = useN1Theme();
  const { isCompact } = useN1Breakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const rail = !isCompact && collapsed;

  const toggleCollapse = useCallback(() => setCollapsed(c => !c), []);

  const renderSidebar = useCallback(
    (props: DrawerContentComponentProps) => (
      <Sidebar
        {...props}
        compact={isCompact}
        collapsed={rail}
        onToggleCollapse={toggleCollapse}
      />
    ),
    [isCompact, rail, toggleCollapse],
  );

  const renderHeader = useCallback(
    ({ navigation }: DrawerHeaderProps) => (
      <TopBar
        compact={isCompact}
        onMenuPress={navigation.openDrawer}
        onProfilePress={() => navigation.navigate('Profile')}
      />
    ),
    [isCompact],
  );

  return (
    <Drawer.Navigator
      initialRouteName={initialRouteName}
      drawerContent={renderSidebar}
      // Back from a screen opened elsewhere (e.g. My profile) returns there.
      backBehavior="history"
      screenOptions={{
        drawerType: isCompact ? 'front' : 'permanent',
        swipeEnabled: isCompact,
        overlayColor: theme.colors.overlay,
        drawerStyle: {
          backgroundColor: theme.colors.surfaceInverse,
          borderRightWidth: 0,
          ...(isCompact
            ? null
            : {
                width: rail
                  ? theme.sidebarWidth.collapsed
                  : theme.sidebarWidth.expanded,
              }),
        },
        header: renderHeader,
        sceneStyle: { backgroundColor: theme.colors.background },
        // Leaving a module resets its stack, so the menu always opens its list.
        popToTopOnBlur: true,
      }}
    >
      {MENU_ITEMS.map(item => (
        <Drawer.Screen
          key={item.route}
          name={item.route}
          component={screenFor(item.route)}
          options={{ title: item.label }}
        />
      ))}
      <Drawer.Screen name="Profile" component={ProfileNavigation} />
    </Drawer.Navigator>
  );
}

export default React.memo(AdminDashboardNavigation);
