import type { EmployeeProfile, EmployeeRole } from '../types';

/** One signed-in person per non-admin login (see MOCK_USERS in auth). */
export const MOCK_EMPLOYEES: Record<EmployeeRole, EmployeeProfile> = {
  'second-admin': {
    id: 'EMP-1007',
    name: 'Priya Sharma',
    role: 'second-admin',
    employeeId: 'EMP-1007',
    department: 'Production',
    shift: 'General (9 AM – 6 PM)',
    joinedOn: '2022-06-01',
    phone: '+91 98450 12345',
    email: 'priya.sharma@abceng.com',
  },
  'machine-operator': {
    id: 'EMP-1042',
    name: 'Ravi Kumar',
    role: 'machine-operator',
    employeeId: 'EMP-1042',
    department: 'Machining',
    shift: 'Morning (6 AM – 2 PM)',
    joinedOn: '2023-03-14',
    phone: '+91 98765 43210',
    email: 'ravi.kumar@abceng.com',
  },
  qc: {
    id: 'EMP-1031',
    name: 'Suresh Babu',
    role: 'qc',
    employeeId: 'EMP-1031',
    department: 'Quality Control',
    shift: 'Morning (6 AM – 2 PM)',
    joinedOn: '2023-01-09',
    phone: '+91 99001 23456',
    email: 'suresh.babu@abceng.com',
  },
};
