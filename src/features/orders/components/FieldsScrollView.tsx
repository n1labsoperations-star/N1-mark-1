import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import {
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { ORDER_STRINGS } from '../constants';

/** Closer than this to the end counts as the end. */
const END_SLACK = 24;

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  content: { gap: t.spacing.lg, paddingBottom: t.spacing.xs },
  // Floats over the bottom of the fields, centred.
  hintRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: t.spacing.sm,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    paddingVertical: t.spacing.xs,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.primary,
    boxShadow: t.shadow.raised,
  },
  pressed: { opacity: t.opacity.pressed },
}));

type Props = { children: ReactNode; testID?: string };

/**
 * The order form's fields, scrolling between the stepper and the buttons. A
 * "Scroll for more fields" pill shows while fields are hidden below; it
 * scrolls down when pressed and goes away at the end.
 */
export function FieldsScrollView({ children, testID }: Props) {
  const styles = useN1Styles(makeStyles);
  const scroll = useRef<ScrollViewInstance>(null);
  const [view, setView] = useState(0);
  const [content, setContent] = useState(0);
  const [offset, setOffset] = useState(0);
  const moreBelow = content - view - offset > END_SLACK;

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => setView(e.nativeEvent.layout.height),
    [],
  );
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) =>
      setOffset(e.nativeEvent.contentOffset.y),
    [],
  );
  // About a screenful at a time, leaving some of the last fields in view.
  const scrollDown = useCallback(
    () =>
      scroll.current?.scrollTo({
        y: Math.min(offset + view * 0.8, content - view),
        animated: true,
      }),
    [offset, view, content],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onLayout={onLayout}
        onContentSizeChange={(_w, h) => setContent(h)}
        onScroll={onScroll}
        testID={testID}
      >
        {children}
      </ScrollView>
      {moreBelow && (
        <View style={styles.hintRow}>
          <Pressable
            accessibilityRole="button"
            onPress={scrollDown}
            style={({ pressed }) => [styles.hint, pressed && styles.pressed]}
            testID={testID && `${testID}-more`}
          >
            <N1Text variant="caption" weight="semiBold" color="onPrimary">
              {ORDER_STRINGS.form.scrollForMore}
            </N1Text>
            <N1Icon name="chevron-down" size="sm" color="onPrimary" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
