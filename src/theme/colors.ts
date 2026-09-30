/**
 * Raw colour palette from the N1 AdminFlow design. Light & dark theme
 * colours are built from it in themes.ts.
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
