import { createN1Styles } from '../../../theme';

// The brand mark keeps the design file's 240 × 171 ratio.
const LOGO_WIDTH = 56;
const LOGO_HEIGHT = 40;

export const makeAuthMobileShellStyles = createN1Styles(t => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.colors.surface,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: t.spacing.xxl,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xxl,
    // Extra room below lifts the centred content a little above the middle.
    paddingBottom: t.spacing.xxxl * 3,
  },
  // Logo and heading sit close together as one brand block.
  brand: {
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  heading: {
    alignItems: 'center',
    gap: t.spacing.xs,
  },
}));
