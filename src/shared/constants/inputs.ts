import type { TextInputProps } from 'react-native';

/**
 * Props for every search box: a real search field (type="search" on web) with
 * autofill off, so the browser's password manager never mistakes it for a
 * login's username box and fills it in when a password field shows up.
 */
export const SEARCH_INPUT_PROPS = {
  keyboardType: 'web-search',
  autoComplete: 'off',
  autoCorrect: false,
  autoCapitalize: 'none',
} as const satisfies TextInputProps;

/**
 * Props for password fields that must never be filled from saved passwords
 * (a new password, or one set for someone else).
 */
/**
 * Stands in for a current password. The real one is never readable by the
 * app, so this only shows that one is set.
 */
export const PASSWORD_MASK = '••••••••';

export const NO_AUTOFILL_PASSWORD_PROPS = {
  autoComplete: 'new-password',
  textContentType: 'newPassword',
  autoCapitalize: 'none',
} as const satisfies TextInputProps;

/**
 * The camera reports a code on every frame it's visible; the same code read
 * again within this window is the same scan, not a new one.
 */
export const QR_RESCAN_DELAY_MS = 2000;
