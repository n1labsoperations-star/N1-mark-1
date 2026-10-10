import { createN1Styles } from '../../../theme';

/** Extra black above the page, so pulling the page down shows no white. */
export const HERO_OVERSCROLL = 1000;

export const makeDashboardHeroStyles = createN1Styles(t => ({
  // Behind the top of the page, bleeding past its padding.
  backdrop: {
    position: 'absolute',
    top: -HERO_OVERSCROLL,
    left: 0,
    right: 0,
    backgroundColor: t.colors.surfaceInverse,
  },
  periods: { flexDirection: 'row', gap: t.spacing.sm },
  period: {
    flex: 1,
    height: t.controlHeight.md,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceInverseActive,
  },
  periodSelected: { backgroundColor: t.colors.surface },
  pressed: { opacity: t.opacity.pressed },
}));
