import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import type { N1DropDownOption } from '../N1DropDown/N1DropDown';
import { N1Text } from '../N1Text/N1Text';
import { N1TextInput, type N1TextInputProps } from '../N1TextInput/N1TextInput';

export type N1ComboboxProps = Omit<
  N1TextInputProps,
  'value' | 'onChangeText' | 'onFocus' | 'onBlur'
> & {
  options: N1DropDownOption<string>[];
  /** The typed text: an option's label, or anything else. */
  value: string;
  onChangeText: (text: string) => void;
  /** An option was picked from the list. */
  onSelect: (option: N1DropDownOption<string>) => void;
};

/** About five matches before the list scrolls. */
const LIST_MAX_HEIGHT = 220;
/**
 * Leaving the field hides the list a moment later, so a press on a match
 * still lands (on web the field blurs before the press).
 */
const BLUR_DELAY_MS = 150;

const makeStyles = createN1Styles(t => ({
  root: { gap: t.spacing.xs },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
    padding: t.spacing.xs,
    borderRadius: t.radius.sm,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.raised,
  },
  option: {
    justifyContent: 'center',
    minHeight: t.controlHeight.sm,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.xs,
  },
  optionActive: { backgroundColor: t.colors.surfaceMuted },
}));

/** Matches an option's label, ignoring case and outer spaces. */
export const findOptionByLabel = (
  options: N1DropDownOption<string>[],
  text: string,
) => {
  const wanted = text.trim().toLowerCase();
  return wanted
    ? options.find(o => o.label.toLowerCase() === wanted)
    : undefined;
};

/**
 * Text field that suggests matching options as you type. Pick one, or keep
 * typing a value that isn't in the list.
 */
export function N1Combobox({
  options,
  value,
  onChangeText,
  onSelect,
  testID,
  ...inputProps
}: N1ComboboxProps) {
  const styles = useN1Styles(makeStyles);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current);
      }
    },
    [],
  );

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return query
      ? options.filter(o => o.label.toLowerCase().includes(query))
      : options;
  }, [options, value]);

  const focus = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
    }
    setOpen(true);
  };
  const blur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), BLUR_DELAY_MS);
  };
  const change = (text: string) => {
    setOpen(true);
    onChangeText(text);
  };
  const choose = (option: N1DropDownOption<string>) => {
    setOpen(false);
    onSelect(option);
  };

  return (
    <View style={styles.root}>
      <N1TextInput
        {...inputProps}
        value={value}
        onChangeText={change}
        onFocus={focus}
        onBlur={blur}
        autoCorrect={false}
        autoComplete="off"
        aria-expanded={open && matches.length > 0}
        testID={testID}
      />
      {open && matches.length > 0 && (
        <View style={styles.list} testID={testID && `${testID}-list`}>
          <ScrollView
            accessibilityRole="list"
            keyboardShouldPersistTaps="handled"
          >
            {matches.map(option => (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                onPress={() => choose(option)}
                onHoverIn={() => setHovered(option.value)}
                onHoverOut={() => setHovered(null)}
                style={({ pressed }) => [
                  styles.option,
                  (pressed || hovered === option.value) && styles.optionActive,
                ]}
              >
                <N1Text variant="small">{option.label}</N1Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
