import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobCardDetailsScreen } from '../screens/JobCardDetailsScreen';
import { JobCardFlowScreen } from '../screens/JobCardFlowScreen';
import { JobCardsListScreen } from '../screens/JobCardsListScreen';
import type { JobCardsStackParamList } from '../types';

const Stack = createNativeStackNavigator<JobCardsStackParamList>();

// Nested inside the admin drawer's "Job Cards" item, which already draws the
// top bar, so the stack hides its own header.
function JobCardsNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobCardsList" component={JobCardsListScreen} />
      <Stack.Screen name="JobCardDetails" component={JobCardDetailsScreen} />
      <Stack.Screen name="JobCardFlow" component={JobCardFlowScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(JobCardsNavigation);
