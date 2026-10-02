import { createN1Styles } from '../../../theme';

export const makeSidebarSearchStyles = createN1Styles(t => ({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: t.controlHeight.md,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.surfaceInverseActive,
  },
  input: {
    flex: 1,
    padding: 0,
    color: t.colors.textInverse,
    fontFamily: t.fontFamily.regular,
    fontSize: t.typography.body.fontSize,
    outlineWidth: 0,
  },
  shortcut: {
    paddingHorizontal: t.spacing.xs,
    paddingVertical: t.spacing.xxs,
    borderRadius: t.radius.xs,
    backgroundColor: t.colors.surfaceInverseActive,
  },
}));
