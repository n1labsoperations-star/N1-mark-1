import { useId, useState, type ReactNode } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { N1Icon, type N1IconName } from '../icons/N1Icon';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from './N1FieldLabel';

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
  containerStyle?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    minHeight: t.controlHeight.md,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  multiline: {
    alignItems: 'flex-start',
    borderRadius: t.radius.md,
    paddingVertical: t.spacing.md,
    minHeight: t.controlHeight.lg * 2,
  },
  focused: { borderColor: t.colors.borderStrong },
  error: { borderColor: t.colors.danger },
  readOnly: {
    backgroundColor: t.colors.surfaceMuted,
    borderStyle: 'dashed',
  },
  disabled: { opacity: t.opacity.disabled },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.regular,
    fontSize: t.typography.body.fontSize,
    padding: 0,
    outlineWidth: 0,
  },
  inputMultiline: { textAlignVertical: 'top' },
  accessory: { alignSelf: 'center' },
}));

export function N1TextInput({
  label,
  required,
  helperText,
  errorText,
  secure = false,
  leftIcon,
  rightElement,
  readOnly = false,
  disabled = false,
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
          multiline && styles.multiline,
          focused && styles.focused,
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
}
