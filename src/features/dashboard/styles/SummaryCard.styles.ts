import { createN1Styles } from '../../../theme';

export const makeSummaryCardStyles = createN1Styles(t => ({
  card: {
    flex: 1,
    minWidth: t.statCardMinWidth,
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.compact,
    backgroundColor: t.colors.surface,
  },
  featured: {
    backgroundColor: t.colors.sidebar,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: t.controlHeight.sm,
    height: t.controlHeight.sm,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    gap: t.spacing.xxs,
  },
}));
