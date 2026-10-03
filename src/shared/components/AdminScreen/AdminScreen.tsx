import { createContext, useContext, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { N1BottomBar, createN1Styles, useN1Breakpoint, useN1Styles } from '..';

export type AdminScreenProps = {
  /** Fixed above the scrolling content, e.g. <DetailHeader />. */
  header?: ReactNode;
  /** Phones only: buttons pinned to the bottom (Create user, Save changes). */
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
  compactFooter,
  fixed = false,
  children,
  testID,
}: AdminScreenProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const background = useContext(AdminScreenBackground);
  return (
    <View
      style={[styles.root, background === 'surface' && styles.surface]}
      testID={testID}
    >
      {fixed && !isCompact ? (
        <View style={[styles.content, styles.fixedContent]}>{children}</View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isCompact && styles.compactContent,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      )}
      {isCompact && compactFooter && <N1BottomBar>{compactFooter}</N1BottomBar>}
    </View>
  );
}
