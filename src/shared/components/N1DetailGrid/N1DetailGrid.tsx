import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1DetailGridItem = {
  label: string;
  value: ReactNode;
};

export type N1DetailGridProps = {
  items: N1DetailGridItem[];
  /** Heading above the grid, e.g. "Additional details". */
  title?: string;
  /** Defaults to 2, as in the design. */
  columns?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: t.spacing.md },
  cell: { gap: t.spacing.xxs, paddingRight: t.spacing.md },
}));

/** Uppercase labels with values below, in columns (PO NUMBER, DC NO…). */
export function N1DetailGrid({
  items,
  title,
  columns = 2,
  style,
  testID,
}: N1DetailGridProps) {
  const styles = useN1Styles(makeStyles);
  const width = `${100 / Math.max(1, columns)}%` as const;
  return (
    <View testID={testID} style={[styles.container, style]}>
      {title && (
        <N1Text variant="title" weight="bold">
          {title}
        </N1Text>
      )}
      <View style={styles.grid}>
        {items.map(item => (
          <View key={item.label} style={[styles.cell, { width }]}>
            <N1Text variant="overline" weight="regular">
              {item.label}
            </N1Text>
            {typeof item.value === 'string' ||
            typeof item.value === 'number' ? (
              <N1Text weight="semiBold">{item.value}</N1Text>
            ) : (
              item.value ?? <N1Text weight="semiBold">—</N1Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
