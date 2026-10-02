import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import type { ProfileStackParamList } from '../types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// Nested inside the admin drawer's hidden "Profile" item, opened from the
// signed-in user in the top bar. The drawer draws the top bar.
function ProfileNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
    </Stack.Navigator>
  );
}

export default React.memo(ProfileNavigation);
