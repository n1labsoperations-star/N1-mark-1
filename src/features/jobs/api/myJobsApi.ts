import { respond } from '../../../services/mock/mockServer';
import type { EmployeeRole } from '../../profile/types';

/** Jobs already on each role's list (work order numbers). */
const SEED: Record<EmployeeRole, string[]> = {
  // 1041 is waiting on a re-initiate: RM QC rejected its material.
  supervisor: ['1041', '1042', '1040', '1035', '1034', '1038'],
  operator: ['1042', '1039', '1034', '1041', '1037'],
  qc: ['1042', '1039', '1041', '1034', '1036'],
};

const copy = () =>
  Object.fromEntries(
    Object.entries(SEED).map(([role, ids]) => [role, [...ids]]),
  ) as Record<EmployeeRole, string[]>;

// Mock backend. Replace with GET /me/jobs and POST /me/jobs.
let lists = copy();

export const myJobsApi = {
  list: (role: EmployeeRole) => respond(lists[role]),
  /** Puts the job at the top of the role's list (once). */
  add: (role: EmployeeRole, id: string) => {
    lists = {
      ...lists,
      [role]: [id, ...lists[role].filter(existing => existing !== id)],
    };
    return respond(lists[role]);
  },
  reset: () => {
    lists = copy();
  },
};
