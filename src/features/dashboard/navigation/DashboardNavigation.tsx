import React, { useCallback, useState } from 'react';
import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerHeaderProps,
} from '@react-navigation/drawer';
import { useN1Breakpoint, useN1Theme } from '../../../shared/components';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { MENU_ITEMS } from '../constants';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import UsersScreen from '../screens/UsersScreen';
import type { AdminDrawerParamList } from '../types';

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

const screenFor = (route: keyof AdminDrawerParamList) =>
  route === 'Users' ? UsersScreen : ComingSoonScreen;

/**
 * Admin shell. Wide screens: a permanent sidebar that can collapse to an icon
 * rail. Phones: the same menu as a slide-in drawer opened from the top bar.
 */
function DashboardNavigation() {
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
      <TopBar compact={isCompact} onMenuPress={navigation.openDrawer} />
    ),
    [isCompact],
  );

  return (
    <Drawer.Navigator
      initialRouteName="Overview"
      drawerContent={renderSidebar}
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
    </Drawer.Navigator>
  );
}

export default React.memo(DashboardNavigation);
