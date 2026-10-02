import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminScreenBackground } from '../../shared/components';
import {
  EditEmployeeProfileScreen,
  EmployeeRoleProvider,
  type EmployeeRole,
} from '../../features/profile';
import type { RoleScreen } from './roleScreens';
import UserTabNavigation from './UserTabNavigation';
import type { UserTab } from './userTabs';
import type { RoleStackParamList } from './types';

const Stack = createNativeStackNavigator<RoleStackParamList>();

type Props = {
  role: EmployeeRole;
  tabs: UserTab[];
  /** The role's own screens, opened over the tabs. */
  screens?: RoleScreen[];
};

/**
 * One non-admin role: its tab bar, with Edit Profile opening over it (no tab
 * bar). The shared profile screens read the role from EmployeeRoleProvider.
 */
function RoleNavigation({ role, tabs, screens = [] }: Props) {
  const renderTabs = useCallback(
    () => <UserTabNavigation tabs={tabs} />,
    [tabs],
  );

  return (
    <EmployeeRoleProvider value={role}>
      {/* Admin screens reused here (job card, flow) sit on white. */}
      <AdminScreenBackground.Provider value="surface">
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs">{renderTabs}</Stack.Screen>
          <Stack.Screen
            name="EditProfile"
            component={EditEmployeeProfileScreen}
          />
          {screens.map(screen => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component}
            />
          ))}
        </Stack.Navigator>
      </AdminScreenBackground.Provider>
    </EmployeeRoleProvider>
  );
}

export default React.memo(RoleNavigation);
