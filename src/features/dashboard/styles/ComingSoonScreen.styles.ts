import { createN1Styles } from '../../../theme';

export const makeComingSoonScreenStyles = createN1Styles(t => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    padding: t.spacing.xxl,
  },
}));
