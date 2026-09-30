/**
 * Spacing, radii, sizes, shadows and opacity tokens from the N1 AdminFlow
 * design.
 *
 * Components never read these directly — they go through the active theme
 * (see themes.ts / useN1Theme) so light and dark mode stay in sync.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export type N1Spacing = keyof typeof spacing;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export type N1Radius = keyof typeof radius;

/** Heights shared by buttons and form fields so rows line up. */
export const controlHeight = {
  sm: 36,
  md: 44,
  lg: 48,
} as const;

export type N1Size = keyof typeof controlHeight;

export const iconSize = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;

export const avatarSize = {
  sm: 32,
  md: 40,
  lg: 64,
} as const;

export const borderWidth = {
  hairline: 1,
  thick: 2,
} as const;

/** Admin sidebar: full width with labels, or an icon-only rail. */
export const sidebarWidth = {
  expanded: 280,
  collapsed: 76,
} as const;

export const modalWidth = {
  sm: 400,
  md: 460,
  lg: 640,
} as const;

/** QR scanner viewfinder: frame size, corner length and scan line. */
export const scanner = {
  frameSize: 240,
  cornerLength: 40,
  cornerWidth: 3,
  lineHeight: 2,
} as const;

/** Numbered circles in a process flow. */
export const stepNumberSize = 26;

/** Stat tiles wrap to two per row on phones below this width. */
export const statCardMinWidth = 150;

export const shadow = {
  none: undefined,
  modal: '0px 12px 32px rgba(0, 0, 0, 0.16)',
  raised: '0px 2px 8px rgba(0, 0, 0, 0.06)',
} as const;

export const opacity = {
  pressed: 0.8,
  disabled: 0.45,
} as const;
