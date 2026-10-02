import { respond } from '../../../services/mock/mockServer';
import type {
  EmployeeProfile,
  EmployeeProfileInput,
  EmployeeRole,
} from '../types';
import { MOCK_EMPLOYEES } from './employeeMockData';

// Mock backend. Replace with GET /me and PATCH /me once auth lands.
let employees = MOCK_EMPLOYEES;

export const employeeProfileApi = {
  fetchProfile: (role: EmployeeRole) => respond(employees[role]),
  updateProfile: async (
    role: EmployeeRole,
    changes: EmployeeProfileInput,
  ): Promise<EmployeeProfile> => {
    employees = { ...employees, [role]: { ...employees[role], ...changes } };
    return respond(employees[role]);
  },
  reset: () => {
    employees = MOCK_EMPLOYEES;
  },
};
