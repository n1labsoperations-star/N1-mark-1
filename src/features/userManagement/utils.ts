import { matchesAny } from '../../shared/hooks';
import type { AdminUser, UserFilters } from './types';

export const userSearchText = (user: AdminUser) =>
  `${user.name} ${user.email} ${user.phone} ${user.designation}`;

/** Email, or the phone number for employees who only have one. */
export const userContact = (user: AdminUser) => user.email || user.phone;

export const matchesUserFilters = (user: AdminUser, filters: UserFilters) =>
  matchesAny(filters.role, user.role) &&
  matchesAny(filters.status, user.status);

export const INITIAL_USER_FILTERS: UserFilters = { role: [], status: [] };
