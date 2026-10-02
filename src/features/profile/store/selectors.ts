import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { ROLE_LABELS } from '../../auth/constants';

export const selectProfileState = (state: RootState) => state.profile;
export const selectMyProfile = (state: RootState) => state.profile.profile;
export const selectOrganization = (state: RootState) =>
  state.profile.organization;

/** Name, email and "Admin · ABC Engineering" for the admin shell. */
export const selectShellUser = createSelector(
  [selectMyProfile, selectOrganization],
  (profile, organization) =>
    profile && {
      name: profile.name,
      email: profile.email,
      subtitle: [ROLE_LABELS[profile.role], organization?.shortName]
        .filter(Boolean)
        .join(' · '),
    },
);
