import { createN1Styles } from '../../../theme';

export const makeAuthHeroStyles = createN1Styles(t => ({
  hero: {
    flex: 1,
    padding: t.spacing.xxxl,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.surfaceInverse,
  },
  // Fills the space above the tagline so the logo sits centred in the panel.
  logo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
