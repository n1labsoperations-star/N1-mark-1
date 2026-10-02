import type React from 'react';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import {
  JobCardDetailsScreen,
  JobCardFlowScreen,
} from '../../features/jobCards';
import {
  AssignMachineScreen,
  EnterJobCodeScreen,
  ImportOrderScreen,
  OperatorJobScreen,
  QcCheckScreen,
  QcFailScreen,
  RawMaterialScreen,
  ScanJobScreen,
} from '../../features/jobs';
import type { RoleStackParamList } from './types';

/** A screen a role opens over its tabs. */
export type RoleScreen = {
  name: Exclude<keyof RoleStackParamList, 'Tabs' | 'EditProfile'>;
  // Screens come typed for the navigator they were built for; any stack that
  // registers the same route names and params can host them.
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

// Slides up from the bottom and closes downwards.
const MODAL: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
};

// Second Admin: import a job (scan / code → order → raw material modal →
// job card) and manage its job card. Job card and flow reuse the admin screens' phone layouts.
export const SECOND_ADMIN_SCREENS: RoleScreen[] = [
  { name: 'ScanJob', component: ScanJobScreen },
  { name: 'EnterJobCode', component: EnterJobCodeScreen },
  { name: 'ImportOrder', component: ImportOrderScreen },
  { name: 'RawMaterial', component: RawMaterialScreen, options: MODAL },
  { name: 'JobCardDetails', component: JobCardDetailsScreen },
  { name: 'JobCardFlow', component: JobCardFlowScreen },
];

// Machine Operator: import a job (scan / code) straight to its Job Detail,
// then start (after Assign Machine), pause and complete operations.
export const MACHINE_OPERATOR_SCREENS: RoleScreen[] = [
  { name: 'ScanJob', component: ScanJobScreen },
  { name: 'EnterJobCode', component: EnterJobCodeScreen },
  { name: 'OperatorJob', component: OperatorJobScreen },
  { name: 'AssignMachine', component: AssignMachineScreen },
];

// QC: import a job (scan / code) into the open tab's QC Check, then pass it,
// or fail it with remarks.
export const QC_SCREENS: RoleScreen[] = [
  { name: 'ScanJob', component: ScanJobScreen },
  { name: 'EnterJobCode', component: EnterJobCodeScreen },
  { name: 'QcCheck', component: QcCheckScreen },
  { name: 'QcFail', component: QcFailScreen },
];
