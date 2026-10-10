import { createN1Styles } from '../../../theme';

export const makeLoginFormStyles = createN1Styles(t => ({
  form: {
    gap: t.spacing.lg,
  },
  // Very small, left aligned, just above the title.
  brand: {
    width: 34,
    height: 24,
    alignSelf: 'flex-start',
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
