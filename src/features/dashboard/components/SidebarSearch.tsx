import React, { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import {
  N1Icon,
  N1Text,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { SEARCH_INPUT_PROPS } from '../../../shared/constants';
import { makeSidebarSearchStyles } from '../styles';

// Just the bits of the browser API the shortcut needs; the project's
// TypeScript config targets React Native, so DOM types aren't loaded.
type WebKeyEvent = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  preventDefault: () => void;
};
type WebDocument = {
  addEventListener: (
    type: 'keydown',
    listener: (e: WebKeyEvent) => void,
  ) => void;
  removeEventListener: (
    type: 'keydown',
    listener: (e: WebKeyEvent) => void,
  ) => void;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Show the ⌘K hint and listen for it (web, wide screens). */
  shortcut: boolean;
  /** Focus the field on mount, e.g. opened from the collapsed rail. */
  autoFocus?: boolean;
  /** Collapsed rail: the same box with just the icon, which expands. */
  collapsed?: boolean;
  onExpand?: () => void;
};

function SidebarSearch({
  value,
  onChangeText,
  shortcut,
  autoFocus = false,
  collapsed = false,
  onExpand,
}: Props) {
  const styles = useN1Styles(makeSidebarSearchStyles);
  const theme = useN1Theme();
  const input = useRef<TextInputInstance | null>(null);
  const shortcutActive = shortcut && Platform.OS === 'web';

  // ⌘K / Ctrl+K focuses the search from anywhere on the page.
  useEffect(() => {
    const doc = (globalThis as { document?: WebDocument }).document;
    if (!shortcutActive || !doc) {
      return undefined;
    }
    const onKeyDown = (event: WebKeyEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.current?.focus();
      }
    };
    doc.addEventListener('keydown', onKeyDown);
    return () => doc.removeEventListener('keydown', onKeyDown);
  }, [shortcutActive]);

  if (collapsed) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search menu"
        onPress={onExpand}
        style={styles.box}
        testID="sidebar-open-search"
      >
        <N1Icon name="search" size="sm" tintColor={theme.colors.textTertiary} />
      </Pressable>
    );
  }

  return (
    <View style={styles.box}>
      <N1Icon name="search" size="sm" tintColor={theme.colors.textTertiary} />
      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search here..."
        placeholderTextColor={theme.colors.textTertiary}
        accessibilityLabel="Search menu"
        {...SEARCH_INPUT_PROPS}
        autoFocus={autoFocus}
        style={styles.input}
      />
      {shortcutActive ? (
        <View style={styles.shortcut}>
          <N1Text variant="caption" weight="bold" color="tertiary">
            ⌘K
          </N1Text>
        </View>
      ) : null}
    </View>
  );
}

export default React.memo(SidebarSearch);
