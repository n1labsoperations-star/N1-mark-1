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
  /** Brand splash wordmark, e.g. the login hero panel. */
  hero: { fontSize: 120, lineHeight: 132, weight: 'bold' },
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
