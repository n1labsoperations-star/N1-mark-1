import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import type { RootState } from '../../app/store';
import type { UserRole } from './constants';
import { sessionActions } from './store/sessionSlice';

const selectSessionRole = (state: RootState) => state.session.role;

/** The signed-in role (null when signed out), with sign in / sign out. */
export function useAuthSession() {
  const dispatch = useAppDispatch();
  const role = useAppSelector(selectSessionRole);
  const signIn = useCallback(
    (next: UserRole) => dispatch(sessionActions.signIn(next)),
    [dispatch],
  );
  const signOut = useCallback(
    () => dispatch(sessionActions.signOut()),
    [dispatch],
  );
  return { role, signIn, signOut };
}
