import type { TextStyle } from 'react-native';
import { fontFamily, type N1FontWeight } from './typography';

/**
 * Ready-made Lato text styles. Each family name (see typography.ts) is the
 * font's PostScript name (iOS), its file name in assets/fonts (Android) and its
 * @font-face family (web), so the same string works on every platform.
 */
export { fontFamily };

export type FontWeight = N1FontWeight;

export const fonts: Record<FontWeight, TextStyle> = {
  regular: { fontFamily: fontFamily.regular },
  semiBold: { fontFamily: fontFamily.semiBold },
  bold: { fontFamily: fontFamily.bold },
};
