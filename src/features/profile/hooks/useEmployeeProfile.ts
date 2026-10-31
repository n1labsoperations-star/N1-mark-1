import { useCallback, useEffect, useMemo } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from '../../../app/store/hooks';
import { useEmployeeRole } from '../context/EmployeeRoleContext';
import { employeeProfileActions } from '../store/employeeProfileSlice';
import type { RootState } from '../../../app/store';
import type { EmployeeProfileInput, EmployeeRole } from '../types';

const selectEmployeeProfileState = (state: RootState) => state.employeeProfile;

/** Nothing is loaded yet, or a different role's profile is. */
const isStale = (
  state: RootState['employeeProfile'],
  role: EmployeeRole,
): boolean =>
  state.status === 'idle' ||
  (state.status === 'succeeded' && state.profile?.role !== role);

/** The signed-in employee's profile for the current role. Loads on first use. */
export function useEmployeeProfile() {
  const role = useEmployeeRole();
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectEmployeeProfileState);
  const stale = isStale(state, role);

  // Read the store, not this render's state: the header and the screen
  // mount together, and only the first of them should load.
  const store = useAppStore();
  useEffect(() => {
    if (isStale(selectEmployeeProfileState(store.getState()), role)) {
      dispatch(employeeProfileActions.fetchRequest(role));
    }
  }, [dispatch, role, stale, store]);

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
