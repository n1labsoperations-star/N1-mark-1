import React, { useCallback, useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { N1BottomTabBar, useN1Theme } from '../../shared/components';
import type { UserTab } from './userTabs';
import type { UserTabParamList } from './types';

const Tab = createBottomTabNavigator<UserTabParamList>();

type Props = {
  /** The role's tabs, in display order. The first one opens on login. */
  tabs: UserTab[];
};

/** Bottom-tab shell shared by the non-admin roles. */
function UserTabNavigation({ tabs }: Props) {
  const theme = useN1Theme();
  const barTabs = useMemo(
    () => tabs.map(({ route, label, icon }) => ({ key: route, label, icon })),
    [tabs],
  );

  const renderTabBar = useCallback(
    ({ state, navigation }: BottomTabBarProps) => (
      <N1BottomTabBar
        tabs={barTabs}
        value={state.routes[state.index].name as keyof UserTabParamList}
        onChange={route => navigation.navigate(route)}
      />
    ),
    [barTabs],
  );

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.route}
          name={tab.route}
          component={tab.component}
          options={{ title: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default React.memo(UserTabNavigation);
