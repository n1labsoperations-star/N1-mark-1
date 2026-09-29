import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1Text } from './N1Text';

export type N1SelectCardProps = {
  title: string;
  subtitle?: string;
  /** Right-hand content, e.g. an "Available" / "In use" badge. */
  right?: ReactNode;
  selected: boolean;
  onPress: () => void;
  /** e.g. a machine that is already in use. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  selected: {
    borderWidth: t.borderWidth.thick,
    borderColor: t.colors.borderStrong,
    // Keeps the content from shifting when the border thickens.
    padding: t.spacing.lg - (t.borderWidth.thick - t.borderWidth.hairline),
  },
  text: { flex: 1, gap: t.spacing.xxs },
  pressed: { opacity: t.opacity.pressed },
  disabled: { opacity: t.opacity.disabled },
}));

/** A pickable option card (Assign Machine). Use several as a single-choice list. */
export function N1SelectCard({
  title,
  subtitle,
  right,
  selected,
  onPress,
  disabled = false,
  style,
  testID,
}: N1SelectCardProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={title}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.text}>
        <N1Text weight="bold">{title}</N1Text>
        {subtitle && (
          <N1Text variant="caption" color="secondary">
            {subtitle}
          </N1Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}
