import { createCrudSlice } from '../../../shared/store';
import type { AdminUser, UserInput } from '../types';

// Oldest first, as in the design (the account owner at the top).
const byJoinedAt = (a: AdminUser, b: AdminUser) =>
  a.joinedAt.localeCompare(b.joinedAt);

export const usersCrud = createCrudSlice<AdminUser, UserInput>(
  'userManagement',
  byJoinedAt,
);

export const userActions = usersCrud.actions;
export default usersCrud.reducer;
