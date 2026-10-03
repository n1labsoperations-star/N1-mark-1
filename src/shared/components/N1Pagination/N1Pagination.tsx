import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Icon } from '../N1Icon/N1Icon';
import { N1Text } from '../N1Text/N1Text';

export type N1PaginationProps = {
  /** e.g. "Showing 10 of 284 invoices". */
  summary?: string;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** Current page, 0-based. With pageCount and onPageChange, shows numbers. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Up to this many pages are all listed; beyond it, gaps become "…". */
const MAX_LISTED_PAGES = 7;

/**
 * Page numbers to show (0-based), with null for a gap: the first and last
 * pages, and the current page with one neighbour on each side.
 */
export function visiblePages(
  page: number,
  pageCount: number,
): (number | null)[] {
  if (pageCount <= MAX_LISTED_PAGES) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }
  const start = Math.max(1, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 2, Math.max(page + 1, 3));
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [
    0,
    ...(start > 1 ? [null] : []),
    ...middle,
    ...(end < pageCount - 2 ? [null] : []),
    pageCount - 1,
  ];
}

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: t.spacing.md,
  },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs },
  // Small grey squares with softly rounded corners.
  button: {
    minWidth: t.avatarSize.sm,
    height: t.avatarSize.sm,
    paddingHorizontal: t.spacing.xs,
    borderRadius: t.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceMuted,
  },
  active: { backgroundColor: t.colors.primary },
  disabled: { opacity: t.opacity.disabled },
  pressed: { opacity: t.opacity.pressed },
  gap: {
    minWidth: t.avatarSize.sm,
    alignItems: 'center',
  },
}));

/** "Showing 10 of 284" on the left; ‹ 1 2 3 … 11 › on the right. */
export const N1Pagination = React.memo(function N1PaginationComponent({
  summary,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  page,
  pageCount,
  onPageChange,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  style,
}: N1PaginationProps) {
  const styles = useN1Styles(makeStyles);
  const numbered =
    page !== undefined && pageCount !== undefined && onPageChange !== undefined;

  const arrow = (
    icon: 'chevron-left' | 'chevron-right',
    label: string,
    enabled: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !enabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <N1Icon name={icon} size="sm" color="textPrimary" />
    </Pressable>
  );

  return (
    <View style={[styles.row, style]}>
      <N1Text variant="small" color="secondary">
        {summary}
      </N1Text>
      <View style={styles.buttons}>
        {arrow('chevron-left', previousLabel, hasPrevious, onPrevious)}
        {numbered &&
          visiblePages(page, pageCount).map((p, index) =>
            p === null ? (
              <View key={`gap-${index}`} style={styles.gap}>
                <N1Text variant="caption" color="secondary">
                  …
                </N1Text>
              </View>
            ) : (
              <Pressable
                key={p}
                accessibilityRole="button"
                accessibilityLabel={`Page ${p + 1}`}
                accessibilityState={{ selected: p === page }}
                onPress={() => onPageChange(p)}
                style={({ pressed }) => [
                  styles.button,
                  p === page && styles.active,
                  pressed && styles.pressed,
                ]}
              >
                <N1Text
                  variant="caption"
                  weight="semiBold"
                  color={p === page ? 'onPrimary' : 'primary'}
                >
                  {p + 1}
                </N1Text>
              </Pressable>
            ),
          )}
        {arrow('chevron-right', nextLabel, hasNext, onNext)}
      </View>
    </View>
  );
});
N1Pagination.displayName = 'N1Pagination';
