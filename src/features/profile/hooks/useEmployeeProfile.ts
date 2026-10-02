import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { useEmployeeRole } from '../context/EmployeeRoleContext';
import { employeeProfileActions } from '../store/employeeProfileSlice';
import type { RootState } from '../../../app/store';
import type { EmployeeProfileInput } from '../types';

const selectEmployeeProfileState = (state: RootState) => state.employeeProfile;

/** The signed-in employee's profile for the current role. Loads on first use. */
export function useEmployeeProfile() {
  const role = useEmployeeRole();
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectEmployeeProfileState);

  // Load when nothing is loaded yet, or when a different role signed in.
  const stale =
    state.status === 'idle' ||
    (state.status === 'succeeded' && state.profile?.role !== role);
  useEffect(() => {
    if (stale) {
      dispatch(employeeProfileActions.fetchRequest(role));
    }
  }, [dispatch, role, stale]);

  const reload = useCallback(
    () => dispatch(employeeProfileActions.fetchRequest(role)),
    [dispatch, role],
  );
  const updateProfile = useCallback(
    (changes: EmployeeProfileInput) =>
      dispatch(employeeProfileActions.updateRequest({ role, changes })),
    [dispatch, role],
  );
  const logout = useCallback(
    () => dispatch(employeeProfileActions.logout()),
    [dispatch],
  );

  return useMemo(
    () => ({
      ...state,
      // Hide another role's profile while this one loads.
      profile: stale ? null : state.profile,
      role,
      reload,
      updateProfile,
      logout,
    }),
    [state, stale, role, reload, updateProfile, logout],
  );
}
