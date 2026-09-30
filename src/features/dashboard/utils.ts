import { ALL } from './constants';
import type { MenuItem, OrgUser } from './types';

/** Menu items for the current layout, narrowed by the sidebar search. */
export function visibleMenuItems(
  items: MenuItem[],
  { compact, query }: { compact: boolean; query: string },
): MenuItem[] {
  const q = query.trim().toLowerCase();
  return items.filter(
    item =>
      (!compact || item.onCompact) &&
      (!q || item.label.toLowerCase().includes(q)),
  );
}

export type UserFilters = { query: string; role: string; status: string };

export function filterUsers(users: OrgUser[], filters: UserFilters): OrgUser[] {
  const q = filters.query.trim().toLowerCase();
  return users.filter(
    user =>
      (!q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)) &&
      (filters.role === ALL || user.role === filters.role) &&
      (filters.status === ALL || user.status === filters.status),
  );
}
