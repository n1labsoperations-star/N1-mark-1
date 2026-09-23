import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LatestScreen from '../screens/LatestScreen';
import PopularScreen from '../screens/PopularScreen';
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
