import { createN1Styles } from '../../../theme';

export const makeSidebarItemStyles = createN1Styles(t => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    height: t.controlHeight.lg,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.compact,
  },
  active: {
    backgroundColor: t.colors.sidebarActive,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
