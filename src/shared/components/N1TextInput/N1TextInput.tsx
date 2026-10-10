import React, { useId, useState, type ReactNode } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { N1Icon, type N1IconName } from '../N1Icon/N1Icon';
import { useN1Breakpoint } from '../../hooks/useN1Breakpoint';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from '../N1FieldLabel/N1FieldLabel';

export type N1TextInputProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label?: string;
  required?: boolean;
  helperText?: string;
  /** Shows the field in red with this message underneath. */
  errorText?: string;
  /** Password field with a show / hide eye toggle. */
  secure?: boolean;
  leftIcon?: N1IconName;
  /** Extra content inside the field on the right, e.g. an "Auto" badge. */
  rightElement?: ReactNode;
  /** Read-only grey field (e.g. an auto-generated code). */
  readOnly?: boolean;
  disabled?: boolean;
  /**
   * 'filled': compact grey field with no border, e.g. a table's search.
   */
  variant?: 'outline' | 'filled';
  containerStyle?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  // The standard form field: square-ish corners, grey focus ring.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    minHeight: t.fieldHeight.regular,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.sm,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  fieldCompact: { minHeight: t.fieldHeight.compact },
  multiline: {
    alignItems: 'flex-start',
    paddingVertical: t.spacing.sm,
    minHeight: t.controlHeight.lg * 2,
  },
  filled: {
    minHeight: t.controlHeight.sm,
    borderColor: t.colors.background,
    backgroundColor: t.colors.background,
  },
  focused: {
    borderColor: t.colors.tone.neutral.solid,
    boxShadow: `0 0 0 ${t.borderWidth.thick + 1}px ${
      t.colors.tone.neutral.background
    }`,
  },
  error: { borderColor: t.colors.danger },
  readOnly: { backgroundColor: t.colors.surfaceMuted },
  disabled: { opacity: t.opacity.disabled },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.regular,
    fontSize: t.typography.small.fontSize,
    padding: 0,
    outlineWidth: 0,
  },
  inputMultiline: { textAlignVertical: 'top' },
  accessory: { alignSelf: 'center' },
}));

export const N1TextInput = React.memo(function N1TextInputComponent({
  label,
  required,
  helperText,
  errorText,
  secure = false,
  leftIcon,
  rightElement,
  readOnly = false,
  disabled = false,
  variant = 'outline',
  multiline,
  containerStyle,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...rest
}: N1TextInputProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const labelId = useId();
  const { isCompact } = useN1Breakpoint();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const editable = !readOnly && !disabled;

  return (
    <View
      style={[styles.container, disabled && styles.disabled, containerStyle]}
    >
      {label && (
        <N1FieldLabel label={label} required={required} nativeID={labelId} />
      )}
      <View
        style={[
          styles.field,
          isCompact && styles.fieldCompact,
          multiline && styles.multiline,
          variant === 'filled' && styles.filled,
          // Filled fields stay borderless while typing.
          focused && variant === 'outline' && styles.focused,
          readOnly && styles.readOnly,
          Boolean(errorText) && styles.error,
        ]}
      >
        {leftIcon && <N1Icon name={leftIcon} size="sm" color="textSecondary" />}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholderTextColor={theme.colors.textTertiary}
          editable={editable}
          multiline={multiline}
          secureTextEntry={secure && hidden}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityLabelledBy={label ? labelId : undefined}
          aria-disabled={!editable}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement && <View style={styles.accessory}>{rightElement}</View>}
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden(h => !h)}
          >
            <N1Icon name={hidden ? 'eye' : 'eye-off'} size="md" />
          </Pressable>
        )}
      </View>
      <N1FieldHelper helperText={helperText} errorText={errorText} />
    </View>
  );
});
N1TextInput.displayName = 'N1TextInput';
