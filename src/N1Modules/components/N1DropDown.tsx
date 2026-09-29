import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useN1Breakpoint } from '../hooks/useN1Breakpoint';
import { N1Icon } from '../icons/N1Icon';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from './N1FieldLabel';
import { N1Text } from './N1Text';

export type N1DropDownOption<T extends string | number> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type N1DropDownProps<T extends string | number> = {
  options: N1DropDownOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  /** Title of the option list. Defaults to the label. */
  sheetTitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
    height: t.controlHeight.md,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.pill,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  fieldOpen: { borderColor: t.colors.borderStrong },
  fieldError: { borderColor: t.colors.danger },
  disabled: { opacity: t.opacity.disabled },
  value: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: t.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: t.spacing.xxl,
  },
  backdropCompact: { justifyContent: 'flex-end', padding: 0 },
  sheet: {
    width: '100%',
    maxWidth: t.modalWidth.sm,
    maxHeight: '70%',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    paddingVertical: t.spacing.md,
    boxShadow: t.shadow.modal,
  },
  sheetCompact: {
    maxWidth: undefined,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: t.spacing.xxl,
  },
  sheetTitle: {
    paddingHorizontal: t.spacing.xl,
    paddingVertical: t.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: t.controlHeight.md,
    paddingHorizontal: t.spacing.xl,
  },
  optionSelected: { backgroundColor: t.colors.surfaceMuted },
  optionPressed: { backgroundColor: t.colors.surfaceMuted },
}));

/** Select field. Opens a list of options (bottom sheet on phones). */
export function N1DropDown<T extends string | number>({
  options,
  value,
  onChange,
  label,
  required,
  placeholder = 'Select',
  helperText,
  errorText,
  disabled = false,
  sheetTitle,
  containerStyle,
  testID,
}: N1DropDownProps<T>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const title = sheetTitle ?? label;

  const choose = (option: N1DropDownOption<T>) => {
    setOpen(false);
    if (option.value !== value) {
      onChange(option.value);
    }
  };

  return (
    <View
      style={[styles.container, disabled && styles.disabled, containerStyle]}
    >
      {label && <N1FieldLabel label={label} required={required} />}
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        aria-valuetext={selected?.label ?? placeholder}
        aria-disabled={disabled}
        aria-expanded={open}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          open && styles.fieldOpen,
          Boolean(errorText) && styles.fieldError,
        ]}
      >
        <N1Text
          style={styles.value}
          color={selected ? 'primary' : 'tertiary'}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </N1Text>
        <N1Icon name="chevron-down" size="sm" />
      </Pressable>
      <N1FieldHelper helperText={helperText} errorText={errorText} />

      <Modal
        visible={open}
        transparent
        animationType={isCompact ? 'slide' : 'fade'}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityLabel="Close options"
          style={[styles.backdrop, isCompact && styles.backdropCompact]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            accessible={false}
            style={[styles.sheet, isCompact && styles.sheetCompact]}
            onPress={() => undefined}
          >
            {title && (
              <N1Text variant="h3" style={styles.sheetTitle}>
                {title}
              </N1Text>
            )}
            <ScrollView accessibilityRole="list">
              {options.map(option => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={String(option.value)}
                    accessibilityRole="menuitem"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    disabled={option.disabled}
                    onPress={() => choose(option)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                      option.disabled && styles.disabled,
                    ]}
                  >
                    <N1Text weight={isSelected ? 'semiBold' : 'regular'}>
                      {option.label}
                    </N1Text>
                    {isSelected && <N1Icon name="check" size="sm" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
