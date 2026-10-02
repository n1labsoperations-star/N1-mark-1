import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  type TextInputInstance,
  type TextInputKeyPressEvent,
} from 'react-native';
import { useN1Styles, useN1Theme } from '../../../shared/components';
import { VERIFICATION_CODE_LENGTH } from '../constants';
import { makeCodeInputStyles } from '../styles';
import { sanitizeCode } from '../utils';

type Props = {
  value: string;
  onChange: (code: string) => void;
  /** Red borders, e.g. after submitting an incomplete code. */
  error?: boolean;
  autoFocus?: boolean;
};

/**
 * One box per digit. Typing moves to the next box, Backspace on an empty box
 * moves back, and pasting (or SMS autofill) spreads the digits across boxes.
 */
function CodeInput({ value, onChange, error = false, autoFocus }: Props) {
  const styles = useN1Styles(makeCodeInputStyles);
  const theme = useN1Theme();
  const inputs = useRef<(TextInputInstance | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const digits = sanitizeCode(value).split('');

  const focus = (index: number) =>
    inputs.current[
      Math.max(0, Math.min(index, VERIFICATION_CODE_LENGTH - 1))
    ]?.focus();

  const handleChange = (index: number, text: string) => {
    const typed = text.replace(/\D/g, '');
    if (!typed) {
      // Cleared this box.
      onChange(digits.slice(0, index).join(''));
      return;
    }
    // A single keystroke, a paste or an autofill: write from this box onwards.
    const next = sanitizeCode(digits.slice(0, index).join('') + typed);
    onChange(next);
    focus(next.length);
  };

  const handleKeyPress = (index: number, event: TextInputKeyPressEvent) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      onChange(digits.slice(0, index - 1).join(''));
      focus(index - 1);
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: VERIFICATION_CODE_LENGTH }, (_, index) => (
        <View key={index} style={styles.cell}>
          <TextInput
            ref={input => {
              inputs.current[index] = input;
            }}
            value={digits[index] ?? ''}
            onChangeText={text => handleChange(index, text)}
            onKeyPress={event => handleKeyPress(index, event)}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            autoFocus={autoFocus && index === 0}
            selectTextOnFocus
            maxLength={VERIFICATION_CODE_LENGTH}
            selectionColor={theme.colors.textPrimary}
            accessibilityLabel={`Digit ${
              index + 1
            } of ${VERIFICATION_CODE_LENGTH}`}
            style={[
              styles.box,
              focused === index && styles.boxFocused,
              error && styles.boxError,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default React.memo(CodeInput);
