import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from '../N1FieldLabel/N1FieldLabel';
import { N1Text } from '../N1Text/N1Text';

export type N1RadioButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

const RADIO_DOT_RATIO = 0.5;

const makeStyles = createN1Styles(t => {
  const outer = t.iconSize.lg;
  const inner = outer * RADIO_DOT_RATIO;
  return {
    row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
    outer: {
      width: outer,
      height: outer,
      borderRadius: t.radius.pill,
      borderWidth: t.borderWidth.hairline,
      borderColor: t.colors.textTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outerSelected: {
      borderWidth: t.borderWidth.thick,
      borderColor: t.colors.primary,
    },
    inner: {
      width: inner,
      height: inner,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.primary,
    },
    disabled: { opacity: t.opacity.disabled },
    group: { gap: t.spacing.sm },
    options: { gap: t.spacing.xl },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  };
});

export function N1RadioButton({
  label,
  selected,
  onPress,
  disabled = false,
  testID,
}: N1RadioButtonProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={[styles.outer, selected && styles.outerSelected]}>
        {selected && <View style={styles.inner} />}
      </View>
      <N1Text>{label}</N1Text>
    </Pressable>
  );
}

export type N1RadioOption<T extends string | number> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type N1RadioGroupProps<T extends string | number> = {
  options: N1RadioOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  label?: string;
  required?: boolean;
  /** Defaults to 'row', as in "Customer Type: Business / Individual". */
  direction?: 'row' | 'column';
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function N1RadioGroup<T extends string | number>({
  options,
  value,
  onChange,
  label,
  required,
  direction = 'row',
  helperText,
  errorText,
  disabled = false,
  style,
}: N1RadioGroupProps<T>) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={[styles.group, style]} accessibilityRole="radiogroup">
      {label && <N1FieldLabel label={label} required={required} />}
      <View style={[styles.options, direction === 'row' && styles.optionsRow]}>
        {options.map(option => (
          <N1RadioButton
            key={String(option.value)}
            label={option.label}
            selected={option.value === value}
            disabled={disabled || option.disabled}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
      <N1FieldHelper helperText={helperText} errorText={errorText} />
    </View>
  );
}
