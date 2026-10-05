import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MachineDetailsScreen } from '../screens/MachineDetailsScreen';
import { MachinesListScreen } from '../screens/MachinesListScreen';
import type { MachinesStackParamList } from '../types';

const Stack = createNativeStackNavigator<MachinesStackParamList>();

// Nested inside the admin drawer's "Machines" item, which already draws the
// top bar, so the stack hides its own header.
function MachinesNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MachinesList" component={MachinesListScreen} />
      <Stack.Screen name="MachineDetails" component={MachineDetailsScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(MachinesNavigation);
