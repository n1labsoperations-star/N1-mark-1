import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { profileActions } from '../store/profileSlice';
import { selectProfileState, selectShellUser } from '../store/selectors';
import type { PasswordChangeInput, ProfileInput } from '../types';

/** Signed-in profile and organization. Loads on first use. */
export function useSession() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectProfileState);
  const shellUser = useAppSelector(selectShellUser);

  // Logout resets the store to idle and leaves the admin area, so the next
  // admin screen to mount (after signing in again) reloads the session.
  useEffect(() => {
    if (state.status === 'idle') {
      dispatch(profileActions.fetchSessionRequest());
    }
  }, [dispatch, state.status]);

  const reload = useCallback(
    () => dispatch(profileActions.fetchSessionRequest()),
    [dispatch],
  );
  const updateProfile = useCallback(
    (input: ProfileInput) =>
      dispatch(profileActions.updateProfileRequest(input)),
    [dispatch],
  );
  const changePassword = useCallback(
    (input: PasswordChangeInput) =>
      dispatch(profileActions.changePasswordRequest(input)),
    [dispatch],
  );
  const logout = useCallback(
    () => dispatch(profileActions.logout()),
    [dispatch],
  );

  return useMemo(
    () => ({
      ...state,
      shellUser,
      reload,
      updateProfile,
      changePassword,
      logout,
    }),
    [state, shellUser, reload, updateProfile, changePassword, logout],
  );
}

/** Organization name for page subtitles; empty until the session loads. */
export function useOrganizationName() {
  const { organization } = useSession();
  return organization?.name ?? '';
}
