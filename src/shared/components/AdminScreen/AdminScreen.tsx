import { createContext, useContext, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { KeyboardScrollView } from '../KeyboardScrollView/KeyboardScrollView';
import {
  N1BottomBar,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  useN1Theme,
} from '..';

export type AdminScreenProps = {
  /**
   * Phones: fixed above the scrolling content, e.g. <DetailHeader /> with a
   * back button and the screen's name. Wide screens don't show it.
   */
  header?: ReactNode;
  /**
   * Phones only: buttons pinned to the bottom (Create user, Save changes).
   * They ride up above the keyboard.
   */
  compactFooter?: ReactNode;
  /**
   * Wide screens: the page itself doesn't scroll. The content fills the
   * window height and scrolls inside its own panels (the dashboard).
   */
  fixed?: boolean;
  children: ReactNode;
  testID?: string;
};

/**
 * Page colour for every AdminScreen below. The admin shell uses the grey
 * 'background' with white cards; the shop-floor roles reuse admin screens on
 * plain white ('surface'), as in the userFlow design.
 */
export const AdminScreenBackground = createContext<'background' | 'surface'>(
  'background',
);

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  surface: { backgroundColor: t.colors.surface },
  scroll: { flex: 1 },
  content: {
    width: '100%',
    gap: t.spacing.lg,
    padding: t.spacing.page,
  },
  compactContent: { padding: t.spacing.lg },
  fixedContent: { flex: 1 },
}));

/** Scrolling page body used by every admin screen. */
export function AdminScreen({
  header,
  compactFooter,
  fixed = false,
  children,
  testID,
}: AdminScreenProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const { isCompact } = useN1Breakpoint();
  const background = useContext(AdminScreenBackground);
  const withFooter = isCompact && Boolean(compactFooter);
  // Phones without a footer bar: the last content (e.g. pagination) clears
  // the home indicator. No provider (isolated renders) means no inset.
  const bottomInset = useContext(SafeAreaInsetsContext)?.bottom ?? 0;
  return (
    <KeyboardAvoidingView
      enabled={withFooter}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, background === 'surface' && styles.surface]}
      testID={testID}
    >
      {isCompact && header}
      {fixed && !isCompact ? (
        <View style={[styles.content, styles.fixedContent]}>{children}</View>
      ) : (
        <KeyboardScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isCompact && styles.compactContent,
            isCompact &&
              !withFooter && {
                paddingBottom: theme.spacing.lg + bottomInset,
              },
          ]}
          // A footer rides up with the keyboard (KeyboardAvoidingView
          // below), so the scroll view mustn't make room for it as well.
          footerMode={withFooter}
        >
          {children}
        </KeyboardScrollView>
      )}
      {withFooter && <N1BottomBar>{compactFooter}</N1BottomBar>}
    </KeyboardAvoidingView>
  );
}
