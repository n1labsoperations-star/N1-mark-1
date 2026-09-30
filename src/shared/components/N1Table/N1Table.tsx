import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useN1Breakpoint } from '../../hooks/useN1Breakpoint';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1TableColumn<T> = {
  key: string;
  /** Header text; shown uppercase. */
  title: string;
  /** Relative width. Defaults to 1. */
  flex?: number;
  align?: 'left' | 'center' | 'right';
  /** Custom cell, e.g. a badge or buttons. Defaults to the row's `key` value. */
  render?: (row: T) => ReactNode;
  /** Leave this column out of the stacked phone card. */
  hideOnCompact?: boolean;
};

export type N1TableProps<T> = {
  columns: N1TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  /** Shown when `data` is empty. */
  emptyText?: string;
  /** Below the rows, e.g. <N1Pagination />. */
  footer?: ReactNode;
  /**
   * Phone layout for one row. Defaults to a card: the first column as the
   * title, the rest as label / value pairs.
   */
  renderCompactItem?: (row: T) => ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  table: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    gap: t.spacing.md,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.md,
    minHeight: t.controlHeight.lg + t.spacing.md,
    gap: t.spacing.md,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  pressed: { backgroundColor: t.colors.background },
  cell: { justifyContent: 'center' },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  right: { alignItems: 'flex-end' },
  empty: { padding: t.spacing.xxl, alignItems: 'center' },
  footer: { paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.lg },
  compactList: { gap: t.spacing.md },
  compactCard: {
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  compactLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.md,
  },
}));

function cellValue<T>(column: N1TableColumn<T>, row: T): ReactNode {
  if (column.render) {
    return column.render(row);
  }
  const raw = (row as Record<string, unknown>)[column.key];
  return <N1Text numberOfLines={2}>{raw == null ? '—' : String(raw)}</N1Text>;
}

/** Data table on wide screens; stacked cards on phones. */
export function N1Table<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  emptyText = 'Nothing to show yet.',
  footer,
  renderCompactItem,
  style,
  testID,
}: N1TableProps<T>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();

  if (data.length === 0) {
    return (
      <View testID={testID} style={[styles.table, style]}>
        <View style={styles.empty}>
          <N1Text color="secondary">{emptyText}</N1Text>
        </View>
      </View>
    );
  }

  if (isCompact) {
    const [first, ...rest] = columns;
    return (
      <View testID={testID} style={[styles.compactList, style]}>
        {data.map(row => {
          const content = renderCompactItem ? (
            renderCompactItem(row)
          ) : (
            <View style={styles.compactCard}>
              {first && cellValue(first, row)}
              {rest
                .filter(c => !c.hideOnCompact)
                .map(column => (
                  <View key={column.key} style={styles.compactLine}>
                    <N1Text variant="overline">{column.title}</N1Text>
                    {cellValue(column, row)}
                  </View>
                ))}
            </View>
          );
          return onRowPress ? (
            <Pressable
              key={keyExtractor(row)}
              accessibilityRole="button"
              onPress={() => onRowPress(row)}
            >
              {content}
            </Pressable>
          ) : (
            <View key={keyExtractor(row)}>{content}</View>
          );
        })}
        {footer}
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.table, style]}>
      <View style={styles.headerRow}>
        {columns.map(column => (
          <View
            key={column.key}
            style={[
              styles.cell,
              styles[column.align ?? 'left'],
              { flex: column.flex ?? 1 },
            ]}
          >
            <N1Text variant="overline">{column.title}</N1Text>
          </View>
        ))}
      </View>
      {data.map(row => {
        const cells = columns.map(column => (
          <View
            key={column.key}
            style={[
              styles.cell,
              styles[column.align ?? 'left'],
              { flex: column.flex ?? 1 },
            ]}
          >
            {cellValue(column, row)}
          </View>
        ));
        // A disabled Pressable would also disable buttons inside the row on web.
        if (!onRowPress) {
          return (
            <View key={keyExtractor(row)} style={styles.row}>
              {cells}
            </View>
          );
        }
        return (
          <Pressable
            key={keyExtractor(row)}
            accessibilityRole="button"
            onPress={() => onRowPress(row)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            {cells}
          </Pressable>
        );
      })}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}
