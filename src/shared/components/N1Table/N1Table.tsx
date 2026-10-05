import React, { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useN1Breakpoint } from '../../hooks/useN1Breakpoint';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import { COMMON_STRINGS } from '../../constants';
import { N1Text } from '../N1Text/N1Text';

export type N1TableColumn<T> = {
  key: string;
  /** Header text. */
  title: string;
  /** Relative width. Defaults to 1. */
  flex?: number;
  align?: 'left' | 'center' | 'right';
  /** Custom cell, e.g. a badge or buttons. Defaults to the row's `key` value. */
  render?: (row: T) => ReactNode;
  /** Leave this column out of the stacked phone card. */
  hideOnCompact?: boolean;
  /**
   * The cell has its own buttons (Edit, Delete). The row then isn't exposed
   * as a button itself, since a button can't contain buttons on web.
   */
  interactive?: boolean;
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
  /** Title on the left of the table's top bar, e.g. "All users". */
  toolbarTitle?: string;
  /** Left of the top bar in place of the title, e.g. <N1Tabs />. */
  toolbarStart?: ReactNode;
  /** Right of the top bar, inside the table: search and filters. */
  toolbar?: ReactNode;
  /**
   * Wide screens: fill the parent's height. The top bar, header row and
   * footer stay put; only the rows scroll.
   */
  scrollable?: boolean;
  /**
   * First load: keep the top bar and footer, with a spinner where the rows
   * go (centred when `scrollable`).
   */
  loading?: boolean;
  /**
   * Phone layout for one row. Defaults to a card: the first column as the
   * title, the rest as label / value pairs.
   */
  renderCompactItem?: (row: T) => ReactNode;
  /**
   * Wide screens: the columns never squeeze below this width; when the
   * table is narrower, the header and rows scroll sideways together.
   */
  minWidth?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  table: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.compact,
    overflow: 'hidden',
  },
  // Title and search / filters across the top, inside the card.
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
    // Same left edge as the header labels and rows.
    paddingHorizontal: t.spacing.sm + t.spacing.md,
    paddingTop: t.spacing.lg,
    paddingBottom: t.spacing.md,
  },
  toolbarControls: { flexGrow: 1 },
  // A light grey band, inset from the card edges, with small labels.
  headerRow: {
    flexDirection: 'row',
    marginHorizontal: t.spacing.sm,
    marginTop: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    gap: t.spacing.md,
    borderRadius: t.radius.tight,
    backgroundColor: t.colors.background,
  },
  headerRowBelowToolbar: { marginTop: 0 },
  fill: { flex: 1 },
  // At least the table's width, so wide windows don't scroll sideways.
  wide: { flexGrow: 1 },
  // Inset like the header band, so columns line up with their labels and
  // the hover highlight is a rounded box starting at the content.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.tight,
    minHeight: t.controlHeight.lg + t.spacing.md,
    gap: t.spacing.md,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  // Light grey under the pointer (web); a step darker while pressed.
  hovered: { backgroundColor: t.colors.background },
  pressed: { backgroundColor: t.colors.surfaceMuted },
  cell: { justifyContent: 'center' },
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  right: { alignItems: 'flex-end' },
  empty: { padding: t.spacing.xxl, alignItems: 'center', gap: t.spacing.sm },
  // Filling table with no rows: the message sits in the middle.
  emptyFill: { flex: 1, justifyContent: 'center' },
  footer: {
    paddingHorizontal: t.spacing.sm + t.spacing.md,
    paddingVertical: t.spacing.lg,
  },
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

type RowProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityRole?: 'button';
  styles: ReturnType<typeof makeStyles>;
};

/**
 * One wide-screen row, highlighted while hovered. Rows without onPress stay
 * plain (no role, never disabled) so their own buttons keep working on web.
 */
function TableRow({ children, onPress, accessibilityRole, styles }: RowProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole={onPress ? accessibilityRole : undefined}
      accessible={Boolean(onPress)}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.row,
        hovered && styles.hovered,
        pressed && onPress && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Data table on wide screens; stacked cards on phones. */
export const N1Table = React.memo(function N1TableComponent<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  emptyText = 'Nothing to show yet.',
  footer,
  toolbarTitle,
  toolbarStart,
  toolbar,
  scrollable = false,
  loading = false,
  renderCompactItem,
  minWidth,
  style,
  testID,
}: N1TableProps<T>) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const { isCompact } = useN1Breakpoint();
  const hasToolbar = Boolean(toolbarTitle || toolbarStart || toolbar);
  // Column labels; kept while loading or empty so the table keeps its shape.
  const headerRow = (
    <View
      style={[styles.headerRow, hasToolbar && styles.headerRowBelowToolbar]}
    >
      {columns.map(column => (
        <View
          key={column.key}
          style={[
            styles.cell,
            styles[column.align ?? 'left'],
            { flex: column.flex ?? 1 },
          ]}
        >
          <N1Text
            variant="caption"
            weight="semiBold"
            color="secondary"
            numberOfLines={1}
          >
            {column.title}
          </N1Text>
        </View>
      ))}
    </View>
  );
  const topBar = hasToolbar ? (
    <View style={styles.toolbar}>
      {toolbarStart ??
        (toolbarTitle ? (
          <N1Text variant="h2" weight="bold" accessibilityRole="header">
            {toolbarTitle}
          </N1Text>
        ) : null)}
      {toolbar ? <View style={styles.toolbarControls}>{toolbar}</View> : null}
    </View>
  ) : null;

  if (loading || data.length === 0) {
    return (
      <View
        testID={testID}
        style={[styles.table, scrollable && !isCompact && styles.fill, style]}
      >
        {topBar}
        {!isCompact && headerRow}
        <View
          style={[styles.empty, scrollable && !isCompact && styles.emptyFill]}
        >
          {loading && <ActivityIndicator color={theme.colors.textSecondary} />}
          <N1Text color="secondary" align="center">
            {loading ? COMMON_STRINGS.loading : emptyText}
          </N1Text>
        </View>
        {/* Pagination stays at the bottom even with nothing to page. */}
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    );
  }

  const rowRole = columns.some(c => c.interactive) ? undefined : 'button';

  if (isCompact) {
    const [first, ...rest] = columns;
    return (
      <View testID={testID} style={[styles.compactList, style]}>
        {toolbar}
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
              accessibilityRole={rowRole}
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

  const rows = data.map(row => {
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
    return (
      <TableRow
        key={keyExtractor(row)}
        accessibilityRole={rowRole}
        onPress={onRowPress && (() => onRowPress(row))}
        styles={styles}
      >
        {cells}
      </TableRow>
    );
  });

  const body = (
    <>
      {headerRow}
      {scrollable ? (
        <ScrollView style={styles.fill} testID={testID && `${testID}-scroll`}>
          {rows}
        </ScrollView>
      ) : (
        rows
      )}
    </>
  );

  return (
    <View
      testID={testID}
      style={[styles.table, scrollable && styles.fill, style]}
    >
      {topBar}
      {minWidth ? (
        // The top bar and footer stay put; columns scroll sideways.
        <ScrollView
          horizontal
          style={scrollable && styles.fill}
          contentContainerStyle={[styles.wide, { minWidth }]}
          testID={testID && `${testID}-hscroll`}
        >
          <View style={styles.fill}>{body}</View>
        </ScrollView>
      ) : (
        body
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}) as <T>(props: N1TableProps<T>) => React.ReactNode;
