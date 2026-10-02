import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardNavigation from './AdminDashboardNavigation';
import RoleNavigation from './RoleNavigation';
import {
  MACHINE_OPERATOR_SCREENS,
  QC_SCREENS,
  SECOND_ADMIN_SCREENS,
} from './roleScreens';
import { MACHINE_OPERATOR_TABS, SECOND_ADMIN_TABS, QC_TABS } from './userTabs';
import type { MainStackParamList } from './types';

// One navigator per non-admin role, defined once so screens stay stable.
const SecondAdminNavigation = React.memo(
  function SecondAdminNavigationComponent() {
    return (
      <RoleNavigation
        role="second-admin"
        tabs={SECOND_ADMIN_TABS}
        screens={SECOND_ADMIN_SCREENS}
      />
    );
  },
);
const MachineOperatorNavigation = React.memo(
  function MachineOperatorNavigationComponent() {
    return (
      <RoleNavigation
        role="machine-operator"
        tabs={MACHINE_OPERATOR_TABS}
        screens={MACHINE_OPERATOR_SCREENS}
      />
    );
  },
);
const QcNavigation = React.memo(function QcNavigationComponent() {
  return <RoleNavigation role="qc" tabs={QC_TABS} screens={QC_SCREENS} />;
});

const Stack = createNativeStackNavigator<MainStackParamList>();

// Nested inside the root stack's "Dashboard" screen, so it must not create
// its own NavigationContainer.
function MainStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Admin" component={AdminDashboardNavigation} />
      <Stack.Screen name="SecondAdmin" component={SecondAdminNavigation} />
      <Stack.Screen
        name="MachineOperator"
        component={MachineOperatorNavigation}
      />
      <Stack.Screen name="Qc" component={QcNavigation} />
    </Stack.Navigator>
  );
}

export default React.memo(MainStackNavigation);
