import { createN1Styles } from '../../../theme';

export const makeCompactTopBarStyles = createN1Styles(t => ({
  // The safe-area top is added inline.
  bar: {
    paddingHorizontal: t.spacing.lg,
    paddingBottom: t.spacing.md,
    backgroundColor: t.colors.surfaceInverse,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  // Menu and greeting; shrinks before the initials when the name is long.
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    flexShrink: 1,
  },
  // Menu and profile: dark rounded squares with light content.
  tile: {
    width: t.controlHeight.md,
    height: t.controlHeight.md,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceInverseActive,
  },
  greeting: { flexShrink: 1 },
  pressed: { opacity: t.opacity.pressed },
}));
