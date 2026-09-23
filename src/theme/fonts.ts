import type { TextStyle } from 'react-native';

/**
 * Lato font families. Each name is the font's PostScript name (iOS), its file
 * name in assets/fonts (Android) and its @font-face family (web), so the same
 * string works on every platform.
 *
 * Pick the weight via fontFamily only: combining a custom fontFamily with
 * fontWeight makes Android fall back to the system font.
 */
export const fontFamily = {
  regular: 'Lato-Regular',
  semiBold: 'Lato-Semibold',
  bold: 'Lato-Bold',
} as const;

export type FontWeight = keyof typeof fontFamily;

export const fonts: Record<FontWeight, TextStyle> = {
  regular: { fontFamily: fontFamily.regular },
  semiBold: { fontFamily: fontFamily.semiBold },
  bold: { fontFamily: fontFamily.bold },
};
