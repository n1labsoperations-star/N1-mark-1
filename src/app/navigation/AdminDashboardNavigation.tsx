import React, { useCallback, useEffect, useState } from 'react';
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
import {
  OrganizationScreen,
  ProfileNavigation,
  useOrganizationName,
} from '../../features/profile';
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

type DrawerScreenComponent = React.ComponentType<any>;

/**
 * Remounts a module each time it loses focus, so coming back to it starts
 * fresh: search, filters, page and open dialogs all reset.
 */
function resetOnBlur(Screen: DrawerScreenComponent): DrawerScreenComponent {
  function ResetOnBlur(props: {
    navigation: { addListener: (e: 'blur', cb: () => void) => () => void };
  }) {
    const [mount, setMount] = useState(0);
    const { navigation } = props;
    useEffect(
      () => navigation.addListener('blur', () => setMount(m => m + 1)),
      [navigation],
    );
    return <Screen key={mount} {...props} />;
  }
  ResetOnBlur.displayName = `ResetOnBlur(${
    Screen.displayName ?? Screen.name ?? 'Screen'
  })`;
  return ResetOnBlur;
}

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

// Built once, so a re-render doesn't remount every module.
const MODULE_SCREENS = new Map(
  MENU_ITEMS.map(item => [item.route, resetOnBlur(screenFor(item.route))]),
);
const ProfileScreen = resetOnBlur(ProfileNavigation);
const OrganizationModule = resetOnBlur(OrganizationScreen);

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

  const organizationName = useOrganizationName();

  const renderHeader = useCallback(
    ({ navigation }: DrawerHeaderProps) => (
      <TopBar
        compact={isCompact}
        onMenuPress={navigation.openDrawer}
        onProfilePress={() => navigation.navigate('Profile')}
        organizationName={organizationName}
        onOrganizationPress={() => navigation.navigate('Organization')}
      />
    ),
    [isCompact, organizationName],
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
          backgroundColor: theme.colors.sidebar,
          borderRightWidth: 0,
          ...(isCompact
            ? null
            : {
                width: rail
                  ? theme.sidebarWidth.collapsed
                  : theme.sidebarWidth.expanded,
              }),
        },
        // Phones only: wide screens have no top bar (the sidebar has it all).
        headerShown: isCompact,
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
          component={MODULE_SCREENS.get(item.route)!}
          options={{ title: item.label }}
        />
      ))}
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Organization" component={OrganizationModule} />
    </Drawer.Navigator>
  );
}

export default React.memo(AdminDashboardNavigation);
