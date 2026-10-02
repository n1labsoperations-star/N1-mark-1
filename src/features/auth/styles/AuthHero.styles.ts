import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import { createN1Styles } from '../../../theme';

// Frosted glass: the photo blurred behind a light, see-through card. Browsers
// blur via backdrop-filter; native gets the tint and border alone.
const BACKDROP_BLUR = Platform.select<ViewStyle>({
  web: {
    backdropFilter: 'blur(18px) saturate(140%)',
    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
  } as ViewStyle,
  default: {},
});

export const makeAuthHeroStyles = createN1Styles(t => ({
  hero: {
    flex: 1,
    padding: t.spacing.md,
    borderRadius: t.radius.xl,
    overflow: 'hidden',
    // The glass card sits at the bottom of the photo.
    justifyContent: 'flex-end',
    backgroundColor: t.colors.surfaceInverse,
  },
  // Very mild black wash over the photo.
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  glass: {
    padding: t.spacing.xl,
    borderRadius: t.radius.lg,
    width: 600,

    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    ...BACKDROP_BLUR,
  },
  // A touch larger and airier than h2, for the quote-like tagline.
  tagline: {
    fontSize: 20,
    lineHeight: 34,
    letterSpacing: 0.4,
  },
}));
