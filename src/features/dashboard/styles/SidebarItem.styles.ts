import { createN1Styles } from '../../../theme';

export const makeSidebarItemStyles = createN1Styles(t => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    height: t.controlHeight.lg,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.pill,
  },
  collapsed: {
    width: t.controlHeight.lg,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  active: {
    backgroundColor: t.colors.surfaceInverseActive,
  },
  pressed: {
    opacity: t.opacity.pressed,
  },
}));
