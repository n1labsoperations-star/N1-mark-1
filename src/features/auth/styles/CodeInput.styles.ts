import { createN1Styles } from '../../../theme';

export const makeCodeInputStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    gap: t.spacing.sm,
  },
  // Square cell; the wrapper sizes it because web text inputs won't shrink.
  cell: {
    flex: 1,
    aspectRatio: 1,
  },
  box: {
    width: '100%',
    height: '100%',
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.bold,
    fontSize: t.typography.h2.fontSize,
    textAlign: 'center',
    padding: 0,
  },
  boxFocused: {
    borderColor: t.colors.borderStrong,
    borderWidth: t.borderWidth.thick,
  },
  boxError: {
    borderColor: t.colors.danger,
  },
}));
