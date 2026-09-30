import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LatestScreen, PopularScreen } from '../../features/feed';
import type { FeedTopTabParamList } from './types';

const TopTab = createMaterialTopTabNavigator<FeedTopTabParamList>();

function FeedTopTabs() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="Latest" component={LatestScreen} />
      <TopTab.Screen name="Popular" component={PopularScreen} />
    </TopTab.Navigator>
  );
}

export default FeedTopTabs;
