import { createN1Styles } from '../../../theme';

export const makeAuthStepStyles = createN1Styles(t => ({
  // Phones: back link pinned to the top, the rest centred in the space below.
  compactRoot: {
    flexGrow: 1,
  },
  compactBody: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  body: {
    gap: t.spacing.lg,
  },
  wideBack: {
    marginBottom: t.spacing.xxl,
  },
  // Pull the ghost button's own padding back so its chevron lines up with the content.
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -t.spacing.xs,
  },
  heading: {
    gap: t.spacing.sm,
  },
  iconCircle: {
    width: t.avatarSize.lg,
    height: t.avatarSize.lg,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceMuted,
    marginBottom: t.spacing.sm,
  },
  iconCircleSuccess: {
    backgroundColor: t.colors.tone.success.background,
  },
}));
