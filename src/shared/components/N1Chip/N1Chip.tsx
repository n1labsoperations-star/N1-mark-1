import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1ChipProps = {
  /** Optional bold prefix, e.g. "Priority:" in "Priority: High". */
  label?: string;
  value: string;
  /** Makes the chip pressable, e.g. as a filter. */
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xs,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs + t.spacing.xxs,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  selected: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  pressed: { opacity: t.opacity.pressed },
}));

/** Outlined pill for key facts (Priority, Due, Qty) or filters. */
export const N1Chip = React.memo(function N1ChipComponent({
  label,
  value,
  onPress,
  selected = false,
  style,
  testID,
}: N1ChipProps) {
  const styles = useN1Styles(makeStyles);
  const textColor = selected ? 'onPrimary' : 'primary';
  const content = (
    <>
      {label && (
        <N1Text variant="caption" color={textColor}>
          {label}
        </N1Text>
      )}
      <N1Text variant="caption" weight="bold" color={textColor}>
        {value}
      </N1Text>
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.chip, style]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      aria-selected={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
});
N1Chip.displayName = 'N1Chip';
