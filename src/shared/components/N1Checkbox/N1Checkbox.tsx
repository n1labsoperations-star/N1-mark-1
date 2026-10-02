import React from 'react';
import { Pressable, View } from 'react-native';
import { N1Icon } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Needed when there is no visible label. */
  accessibilityLabel?: string;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  box: {
    width: t.iconSize.md,
    height: t.iconSize.md,
    borderRadius: t.radius.xs,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.textTertiary,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
  disabled: { opacity: t.opacity.disabled },
}));

export const N1Checkbox = React.memo(function N1CheckboxComponent({
  label,
  checked,
  onChange,
  disabled = false,
  accessibilityLabel,
  testID,
}: N1CheckboxProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={4}
      onPress={() => onChange(!checked)}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <N1Icon name="check" size="sm" color="onPrimary" />}
      </View>
      {label && <N1Text variant="small">{label}</N1Text>}
    </Pressable>
  );
});
N1Checkbox.displayName = 'N1Checkbox';
