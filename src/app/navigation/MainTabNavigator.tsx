import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedTopTabs from './FeedTopTabs';
import { SearchScreen } from '../../features/search';
import { ProfileScreen } from '../../features/profile';
import { Icon } from '../../shared/components';
import type { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type TabIconProps = { color: string; size: number };

const HomeTabIcon = ({ color, size }: TabIconProps) => (
  <Icon name="home" color={color} size={size} />
);

function MainTabNavigator() {
  return (
    // The drawer already renders a header, so tabs don't need their own.
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Feed"
        component={FeedTopTabs}
        options={{ tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default React.memo(MainTabNavigator);
