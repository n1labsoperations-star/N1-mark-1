/**
 * Raw design tokens taken from the N1 AdminFlow design.
 *
 * Components never read these directly — they go through the active theme
 * (see themes.ts / useN1Theme) so light and dark mode stay in sync.
 */

export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  ink900: '#111111',
  ink800: '#1C1C1C',
  ink700: '#2A2A2A',
  ink600: '#3A3A3A',
  grey500: '#6B6B6B',
  grey400: '#8E8E8E',
  grey300: '#B5B5B5',
  grey200: '#E3E3E3',
  grey150: '#ECECEC',
  grey100: '#F2F2F2',
  grey50: '#F7F7F7',

  green700: '#1E7A45',
  green500: '#1FA37A',
  green100: '#E6F4EC',
  blue700: '#1F5FBF',
  blue500: '#2F6FD6',
  blue100: '#E6EFFB',
  amber700: '#B26A00',
  amber500: '#E8A317',
  amber100: '#FCF0DC',
  red700: '#B42318',
  red500: '#D64535',
  red100: '#FCE8E6',
  orange500: '#E8663D',
  pink500: '#E77FA8',

  overlayLight: 'rgba(17, 17, 17, 0.45)',
  overlayDark: 'rgba(0, 0, 0, 0.65)',
  scanLine: '#35D07F',
} as const;

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

/**
 * Lato ships with the app (assets/fonts). Pick the weight via fontFamily only:
 * combining a custom fontFamily with fontWeight makes Android fall back to the
 * system font.
 */
export const fontFamily = {
  regular: 'Lato-Regular',
  semiBold: 'Lato-Semibold',
  bold: 'Lato-Bold',
} as const;

export type N1FontWeight = keyof typeof fontFamily;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, weight: 'bold' },
  h1: { fontSize: 26, lineHeight: 32, weight: 'bold' },
  h2: { fontSize: 20, lineHeight: 28, weight: 'bold' },
  h3: { fontSize: 16, lineHeight: 22, weight: 'bold' },
  stat: { fontSize: 22, lineHeight: 28, weight: 'bold' },
  title: { fontSize: 15, lineHeight: 20, weight: 'semiBold' },
  body: { fontSize: 14, lineHeight: 20, weight: 'regular' },
  label: { fontSize: 13, lineHeight: 18, weight: 'semiBold' },
  small: { fontSize: 13, lineHeight: 18, weight: 'regular' },
  caption: { fontSize: 12, lineHeight: 16, weight: 'regular' },
  overline: { fontSize: 12, lineHeight: 16, weight: 'bold' },
} as const satisfies Record<
  string,
  { fontSize: number; lineHeight: number; weight: N1FontWeight }
>;

export type N1TextVariant = keyof typeof typography;

/** Letter spacing for uppercase overline labels (table headers, sections). */
export const overlineLetterSpacing = 0.6;

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

/** Width at which layouts switch from mobile to desktop. */
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
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
