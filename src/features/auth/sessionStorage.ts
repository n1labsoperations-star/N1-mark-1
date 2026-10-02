import { USER_ROLES, type UserRole } from './constants';

const KEY = 'n1.session.role';

/** The part of the browser's localStorage used here. */
type KeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};
const ROLES = Object.values(USER_ROLES) as string[];

// Web keeps the signed-in role across refreshes; native (and tests) have no
// localStorage, so the session lasts until the app closes.
function storage(): KeyValueStorage | null {
  try {
    return (
      (globalThis as { localStorage?: KeyValueStorage }).localStorage ?? null
    );
  } catch {
    return null;
  }
}

export function loadSessionRole(): UserRole | null {
  try {
    const value = storage()?.getItem(KEY) ?? null;
    return value && ROLES.includes(value) ? (value as UserRole) : null;
  } catch {
    return null;
  }
}

export function saveSessionRole(role: UserRole | null) {
  try {
    if (role) {
      storage()?.setItem(KEY, role);
    } else {
      storage()?.removeItem(KEY);
    }
  } catch {
    // Storage blocked (private mode): the session just won't survive a refresh.
  }
}
