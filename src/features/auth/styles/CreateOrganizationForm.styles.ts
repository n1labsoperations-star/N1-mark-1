import { createN1Styles } from '../../../theme';

export const makeCreateOrganizationFormStyles = createN1Styles(t => ({
  form: {
    gap: t.spacing.lg,
  },
  header: {
    gap: t.spacing.sm,
    alignItems: 'flex-start',
  },
  // Pull the ghost button's own padding back so its chevron lines up with the title.
  backButton: {
    marginLeft: -t.spacing.xs,
  },
  // Two fields side by side on wide screens; stacked on phones.
  row: {
    flexDirection: 'row',
    gap: t.spacing.lg,
  },
  rowItem: {
    flex: 1,
  },
}));
