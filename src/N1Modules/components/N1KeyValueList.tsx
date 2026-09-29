import { isValidElement, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1Text } from './N1Text';

export type N1KeyValueItem = {
  label: string;
  /** Text, or a node such as a badge. */
  value: ReactNode;
};

export type N1KeyValueListProps = {
  items: N1KeyValueItem[];
  /** Bold heading inside the panel, e.g. "Details" or "Machine assigned". */
  title?: string;
  /** Hairlines between rows (as on the Profile screen). */
  dividers?: boolean;
  /** 'panel' draws the soft grey box; 'plain' has no background. */
  variant?: 'panel' | 'plain';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  panel: {
    backgroundColor: t.colors.background,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  title: { paddingVertical: t.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  divider: {
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  value: { flexShrink: 1, textAlign: 'right' },
}));

/** Label on the left, value on the right (Employee ID, Material, Quantity…). */
export function N1KeyValueList({
  items,
  title,
  dividers = false,
  variant = 'panel',
  style,
  testID,
}: N1KeyValueListProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View testID={testID} style={[variant === 'panel' && styles.panel, style]}>
      {title && (
        <N1Text variant="title" weight="bold" style={styles.title}>
          {title}
        </N1Text>
      )}
      {items.map((item, index) => (
        <View
          key={item.label}
          style={[styles.row, dividers && index > 0 && styles.divider]}
        >
          <N1Text variant="small" color="secondary">
            {item.label}
          </N1Text>
          {isValidElement(item.value) ? (
            item.value
          ) : (
            <N1Text variant="small" weight="semiBold" style={styles.value}>
              {item.value}
            </N1Text>
          )}
        </View>
      ))}
    </View>
  );
}
