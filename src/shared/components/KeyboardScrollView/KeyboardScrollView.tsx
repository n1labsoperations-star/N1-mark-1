import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
} from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  type ScrollViewInstance,
} from 'react-native';

export type KeyboardScrollViewProps = ComponentPropsWithRef<
  typeof ScrollView
> & {
  /**
   * The screen shrinks above the keyboard instead (a KeyboardAvoidingView
   * around it, for a footer that rides up). Then this only scrolls the
   * focused field into view.
   */
  footerMode?: boolean;
};

/** Room between the focused field and the keyboard (or footer). */
const FOCUS_GAP = 16;

/**
 * ScrollView for anything with fields. iOS moves its content clear of the
 * keyboard and keeps the focused field in view; Android resizes the window
 * for the keyboard already. Taps on buttons work while the keyboard is up.
 */
export function KeyboardScrollView({
  footerMode = false,
  ref,
  ...props
}: KeyboardScrollViewProps) {
  const own = useRef<ScrollViewInstance | null>(null);
  const setRef = useCallback(
    (node: ScrollViewInstance | null) => {
      own.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    if (!footerMode || Platform.OS !== 'ios') {
      return undefined;
    }
    // Once the screen has shrunk, bring the focused field above the keyboard.
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      const input = TextInput.State.currentlyFocusedInput();
      if (input && own.current) {
        own.current.scrollResponderScrollNativeHandleToKeyboard(
          input,
          FOCUS_GAP,
          true,
        );
      }
    });
    return () => sub.remove();
  }, [footerMode]);

  return (
    <ScrollView
      ref={setRef}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={!footerMode}
      {...props}
    />
  );
}
