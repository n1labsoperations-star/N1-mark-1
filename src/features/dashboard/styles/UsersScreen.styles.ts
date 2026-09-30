import { createN1Styles } from '../../../theme';

export const makeUsersScreenStyles = createN1Styles(t => ({
  content: {
    gap: t.spacing.xl,
    padding: t.spacing.xxl,
  },
  compactContent: {
    padding: t.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.lg,
  },
  heading: {
    gap: t.spacing.xs,
    flexShrink: 1,
  },
  filters: {
    flexDirection: 'row',
    gap: t.spacing.md,
  },
  compactFilters: {
    flexDirection: 'column',
  },
  // Wide screens only: on phones each part keeps its natural height.
  search: {
    flex: 3,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: t.spacing.md,
  },
  wideDropdownRow: {
    flex: 2,
  },
  dropdown: {
    flex: 1,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.xs,
  },
}));
