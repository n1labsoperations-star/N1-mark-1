import React from 'react';
import {
  AdminScreen,
  ComingSoon,
  type N1IconName,
} from '../../shared/components';
import { MyJobsScreen, QcListScreen } from '../../features/jobs';
import { EmployeeProfileScreen } from '../../features/profile';
import type { UserTabParamList } from './types';

export type UserTab = {
  route: keyof UserTabParamList;
  label: string;
  icon: N1IconName;
  component: React.ComponentType;
};

const PLACEHOLDER_MESSAGE = 'This section will be available here shortly.';

// Stands in for a tab until its real screen exists. Named after the role so
// each role visibly lands somewhere different.
const placeholder = (title: string) => {
  const Placeholder = React.memo(function PlaceholderScreen() {
    return (
      <AdminScreen>
        <ComingSoon title={title} message={PLACEHOLDER_MESSAGE} />
      </AdminScreen>
    );
  });
  Placeholder.displayName = `Placeholder(${title})`;
  return Placeholder;
};

// Jobs differs per role; Profile is the same screen for everyone.
const roleTabs = (
  role: string,
  jobs: React.ComponentType = placeholder(`${role} · Jobs`),
): UserTab[] => [
  {
    route: 'Jobs',
    label: 'Jobs',
    icon: 'clipboard',
    component: jobs,
  },
  {
    route: 'Profile',
    label: 'Profile',
    icon: 'user',
    component: EmployeeProfileScreen,
  },
];

// Swap a tab's `component` (or add / remove tabs) as each role's screens land.
export const SECOND_ADMIN_TABS = roleTabs('Second Admin', MyJobsScreen);
export const MACHINE_OPERATOR_TABS = roleTabs('Machine Operator', MyJobsScreen);
export const QC_TABS = roleTabs('QC', QcListScreen);
