import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1ListItemProps = {
  /** e.g. "WO-00125 · Machined Shaft". */
  title: string;
  /** e.g. "CNC Turning · Lathe 02". */
  subtitle?: string;
  /** Top-right content, usually a status badge. */
  right?: ReactNode;
  /** Extra content under the text: a progress bar, buttons… */
  children?: ReactNode;
  onPress?: () => void;
  /** Hairline under the row. Defaults to true. */
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  item: {
    gap: t.spacing.sm,
    paddingVertical: t.spacing.md,
  },
  divider: {
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  title: { flex: 1 },
  pressed: { opacity: t.opacity.pressed },
}));

/** One row in a list of jobs or QC checks. */
export const N1ListItem = React.memo(function N1ListItemComponent({
  title,
  subtitle,
  right,
  children,
  onPress,
  divider = true,
  style,
  testID,
}: N1ListItemProps) {
  const styles = useN1Styles(makeStyles);
  const content = (
    <>
      <View style={styles.header}>
        <N1Text
          variant="label"
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </N1Text>
        {right}
      </View>
      {subtitle && (
        <N1Text variant="caption" color="secondary">
          {subtitle}
        </N1Text>
      )}
      {children}
    </>
  );
  const itemStyle = [styles.item, divider && styles.divider, style];

  if (!onPress) {
    return (
      <View testID={testID} style={itemStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [itemStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
});
N1ListItem.displayName = 'N1ListItem';
