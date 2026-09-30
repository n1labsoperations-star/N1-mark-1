import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MainTabNavigator from './MainTabNavigator';
import { SettingsScreen } from '../../features/settings';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={MainTabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default React.memo(DrawerNavigator);
