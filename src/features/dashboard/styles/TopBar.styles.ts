import { createN1Styles } from '../../../theme';

export const makeTopBarStyles = createN1Styles(t => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: t.spacing.md,
    backgroundColor: t.colors.surface,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  // Phones: dark bar with the menu button, matching the drawer.
  compactBar: {
    paddingHorizontal: t.spacing.lg,
    backgroundColor: t.colors.surfaceInverse,
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    flexShrink: 1,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  pressed: { opacity: t.opacity.pressed },
  // Shrinks before the user block when the name is long.
  organization: { flexShrink: 1 },
}));
