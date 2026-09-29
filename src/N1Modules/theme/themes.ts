import {
  avatarSize,
  borderWidth,
  breakpoints,
  controlHeight,
  fontFamily,
  iconSize,
  modalWidth,
  opacity,
  overlineLetterSpacing,
  palette,
  radius,
  scanner,
  shadow,
  spacing,
  statCardMinWidth,
  stepNumberSize,
  typography,
} from './tokens';

/** Semantic colours for status tags, stat values and icons. */
export type N1Tone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

type ToneColors = {
  /** Soft background, e.g. a status tag. */
  background: string;
  /** Text / icon colour on the soft background. */
  foreground: string;
  /** Strong colour, e.g. a dot, progress fill or stat value. */
  solid: string;
};

export type N1Colors = {
  /** Page background behind cards. */
  background: string;
  /** Cards, modals, inputs. */
  surface: string;
  /** Subtle fills: read-only inputs, tab track, hover rows. */
  surfaceMuted: string;
  /** Dark surfaces: sidebar, primary button, avatars. */
  surfaceInverse: string;
  /** Highlighted item on an inverse surface (active sidebar item). */
  surfaceInverseActive: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  primary: string;
  onPrimary: string;
  danger: string;
  onDanger: string;
  overlay: string;
  /** The camera screen stays dark in both themes. */
  scannerBackground: string;
  scannerForeground: string;
  scannerLine: string;
  /** Round buttons on the camera screen. */
  scannerControl: string;
  tone: Record<N1Tone, ToneColors>;
  /** Categorical colours for charts, in order. */
  chart: readonly string[];
};

const lightColors: N1Colors = {
  background: palette.grey100,
  surface: palette.white,
  surfaceMuted: palette.grey150,
  surfaceInverse: palette.ink900,
  surfaceInverseActive: palette.ink700,
  textPrimary: palette.ink900,
  textSecondary: palette.grey500,
  textTertiary: palette.grey400,
  textInverse: palette.white,
  border: palette.grey200,
  borderStrong: palette.ink900,
  primary: palette.ink900,
  onPrimary: palette.white,
  danger: palette.red700,
  onDanger: palette.white,
  overlay: palette.overlayLight,
  scannerBackground: palette.black,
  scannerForeground: palette.white,
  scannerLine: palette.scanLine,
  scannerControl: palette.ink700,
  tone: {
    neutral: {
      background: palette.grey150,
      foreground: palette.ink600,
      solid: palette.grey500,
    },
    success: {
      background: palette.green100,
      foreground: palette.green700,
      solid: palette.green700,
    },
    info: {
      background: palette.blue100,
      foreground: palette.blue700,
      solid: palette.blue700,
    },
    warning: {
      background: palette.amber100,
      foreground: palette.amber700,
      solid: palette.amber700,
    },
    danger: {
      background: palette.red100,
      foreground: palette.red700,
      solid: palette.red700,
    },
  },
  chart: [
    palette.blue500,
    palette.orange500,
    palette.green500,
    palette.amber500,
    palette.pink500,
  ],
};

const darkColors: N1Colors = {
  background: palette.black,
  surface: palette.ink800,
  surfaceMuted: palette.ink700,
  surfaceInverse: palette.grey100,
  surfaceInverseActive: palette.grey200,
  textPrimary: palette.grey50,
  textSecondary: palette.grey300,
  textTertiary: palette.grey400,
  textInverse: palette.ink900,
  border: palette.ink600,
  borderStrong: palette.grey50,
  primary: palette.grey50,
  onPrimary: palette.ink900,
  danger: palette.red500,
  onDanger: palette.white,
  overlay: palette.overlayDark,
  scannerBackground: palette.black,
  scannerForeground: palette.white,
  scannerLine: palette.scanLine,
  scannerControl: palette.ink700,
  tone: {
    neutral: {
      background: palette.ink700,
      foreground: palette.grey200,
      solid: palette.grey300,
    },
    success: {
      background: palette.green700,
      foreground: palette.green100,
      solid: palette.green500,
    },
    info: {
      background: palette.blue700,
      foreground: palette.blue100,
      solid: palette.blue500,
    },
    warning: {
      background: palette.amber700,
      foreground: palette.amber100,
      solid: palette.amber500,
    },
    danger: {
      background: palette.red700,
      foreground: palette.red100,
      solid: palette.red500,
    },
  },
  chart: lightColors.chart,
};

const shared = {
  spacing,
  radius,
  typography,
  fontFamily,
  overlineLetterSpacing,
  controlHeight,
  iconSize,
  avatarSize,
  borderWidth,
  breakpoints,
  modalWidth,
  statCardMinWidth,
  scanner,
  stepNumberSize,
  shadow,
  opacity,
};

export type N1ColorMode = 'light' | 'dark';

export type N1Theme = typeof shared & {
  mode: N1ColorMode;
  colors: N1Colors;
};

export const lightTheme: N1Theme = {
  ...shared,
  mode: 'light',
  colors: lightColors,
};
export const darkTheme: N1Theme = {
  ...shared,
  mode: 'dark',
  colors: darkColors,
};
