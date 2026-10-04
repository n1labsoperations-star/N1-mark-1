import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type HostInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { N1Icon } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1FieldHelper, N1FieldLabel } from '../N1FieldLabel/N1FieldLabel';
import { N1Text } from '../N1Text/N1Text';

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
  /** 'filled': compact grey field with no border, e.g. a table's filters. */
  variant?: 'outline' | 'filled';
  /** For screen readers when there's no visible label (toolbar filters). */
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/** The list shows about six options before it scrolls. */
const MENU_MAX_HEIGHT = 240;
/** Space between the field and its list. */
const MENU_GAP = 6;

/** Where the list sits: under the field, or above when there's no room. */
type MenuAnchor = { left: number; minWidth: number; maxWidth: number } & (
  | { top: number }
  | { bottom: number }
);

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  // Matches N1TextInput: the standard form field.
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
    height: t.controlHeight.sm + t.spacing.xs,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.sm,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  fieldFilled: {
    height: t.controlHeight.sm,
    borderColor: t.colors.background,
    backgroundColor: t.colors.background,
  },
  fieldOpen: {
    borderColor: t.colors.tone.neutral.solid,
    boxShadow: `0 0 0 ${t.borderWidth.thick + 1}px ${
      t.colors.tone.neutral.background
    }`,
  },
  fieldError: { borderColor: t.colors.danger },
  disabled: { opacity: t.opacity.disabled },
  value: { flex: 1 },
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    maxHeight: MENU_MAX_HEIGHT,
    padding: t.spacing.xs,
    borderRadius: t.radius.sm,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.raised,
  },
  // Hidden for the moment before the field has been measured.
  menuMeasuring: { opacity: 0 },
  option: {
    justifyContent: 'center',
    minHeight: t.controlHeight.sm,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.xs,
  },
  optionActive: { backgroundColor: t.colors.surfaceMuted },
}));

/** Select field. Its options open in a list right under the field. */
export const N1DropDown = React.memo(function N1DropDownComponent<
  T extends string | number,
>({
  options,
  value,
  onChange,
  label,
  required,
  placeholder = 'Select',
  helperText,
  errorText,
  disabled = false,
  variant = 'outline',
  accessibilityLabel,
  containerStyle,
  testID,
}: N1DropDownProps<T>) {
  const styles = useN1Styles(makeStyles);
  const window = useWindowDimensions();
  const field = useRef<HostInstance | null>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [hovered, setHovered] = useState<T | null>(null);
  const selected = options.find(o => o.value === value);

  const choose = (option: N1DropDownOption<T>) => {
    setOpen(false);
    if (option.value !== value) {
      onChange(option.value);
    }
  };

  const show = () => {
    setAnchor(null);
    setOpen(true);
    field.current?.measureInWindow((x, y, w, h) => {
      const below = window.height - (y + h + MENU_GAP);
      const across = {
        left: x,
        minWidth: w,
        maxWidth: Math.max(w, window.width - x - MENU_GAP),
      };
      setAnchor(
        below < MENU_MAX_HEIGHT && y > below
          ? { ...across, bottom: window.height - y + MENU_GAP }
          : { ...across, top: y + h + MENU_GAP },
      );
    });
  };

  return (
    <View
      style={[styles.container, disabled && styles.disabled, containerStyle]}
    >
      {label && <N1FieldLabel label={label} required={required} />}
      <Pressable
        ref={field}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        aria-valuetext={selected?.label ?? placeholder}
        aria-disabled={disabled}
        aria-expanded={open}
        disabled={disabled}
        onPress={show}
        style={[
          styles.field,
          variant === 'filled' && styles.fieldFilled,
          open && styles.fieldOpen,
          Boolean(errorText) && styles.fieldError,
        ]}
      >
        <N1Text
          variant="small"
          style={styles.value}
          color={selected ? 'primary' : 'tertiary'}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </N1Text>
        <N1Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" />
      </Pressable>
      <N1FieldHelper helperText={helperText} errorText={errorText} />

      <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="Close options"
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        />
        <View
          style={[styles.menu, anchor ?? styles.menuMeasuring]}
          testID={testID && `${testID}-menu`}
        >
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
                  onHoverIn={() => setHovered(option.value)}
                  onHoverOut={() => setHovered(null)}
                  style={({ pressed }) => [
                    styles.option,
                    (isSelected || pressed || hovered === option.value) &&
                      styles.optionActive,
                    option.disabled && styles.disabled,
                  ]}
                >
                  <N1Text
                    variant="small"
                    weight={isSelected ? 'semiBold' : 'regular'}
                  >
                    {option.label}
                  </N1Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}) as <T extends string | number>(props: N1DropDownProps<T>) => React.ReactNode;
