import { createContext, useContext } from 'react';
import type { EmployeeRole } from '../types';

const EmployeeRoleContext = createContext<EmployeeRole | null>(null);

/** Set by each role's navigator so the shared profile screens know whose profile to show. */
export const EmployeeRoleProvider = EmployeeRoleContext.Provider;

export function useEmployeeRole(): EmployeeRole {
  const role = useContext(EmployeeRoleContext);
  if (!role) {
    throw new Error('useEmployeeRole must be used inside EmployeeRoleProvider');
  }
  return role;
}
