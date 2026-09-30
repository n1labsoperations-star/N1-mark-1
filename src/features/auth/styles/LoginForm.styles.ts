import { createN1Styles } from '../../../theme';

export const makeLoginFormStyles = createN1Styles(t => ({
  form: {
    gap: t.spacing.lg,
  },
  // Extra room between the logo and the title.
  logo: {
    marginBottom: t.spacing.xxl,
  },
  heading: {
    gap: t.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsRowEnd: {
    justifyContent: 'flex-end',
  },
}));
