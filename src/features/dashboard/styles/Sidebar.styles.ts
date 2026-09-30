import { createN1Styles } from '../../../theme';

export const makeSidebarStyles = createN1Styles(t => ({
  root: {
    flex: 1,
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.xl,
    backgroundColor: t.colors.surfaceInverse,
  },
  rootCollapsed: {
    alignItems: 'center',
    paddingHorizontal: t.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: t.spacing.sm,
  },
  headerCollapsed: {
    justifyContent: 'center',
    paddingLeft: 0,
  },
  sectionLabel: {
    marginTop: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  menu: {
    gap: t.spacing.xs,
  },
  // Pushes the user card to the bottom of the phone drawer.
  spacer: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surfaceInverseActive,
  },
  userCardText: {
    flex: 1,
  },
}));
