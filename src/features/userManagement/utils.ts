import { matchesOption } from '../../shared/hooks';
import type { AdminUser, UserFilters } from './types';

export const userSearchText = (user: AdminUser) =>
  `${user.name} ${user.email} ${user.designation}`;

export const matchesUserFilters = (user: AdminUser, filters: UserFilters) =>
  matchesOption(filters.role, user.role) &&
  matchesOption(filters.status, user.status);

export const INITIAL_USER_FILTERS: UserFilters = { role: 'all', status: 'all' };
