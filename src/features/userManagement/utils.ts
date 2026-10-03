import { matchesAny } from '../../shared/hooks';
import type { AdminUser, UserFilters } from './types';

export const userSearchText = (user: AdminUser) =>
  `${user.name} ${user.email} ${user.designation}`;

export const matchesUserFilters = (user: AdminUser, filters: UserFilters) =>
  matchesAny(filters.role, user.role) &&
  matchesAny(filters.status, user.status);

export const INITIAL_USER_FILTERS: UserFilters = { role: [], status: [] };
