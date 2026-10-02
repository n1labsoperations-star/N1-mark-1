import { createContext, useContext, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { N1BottomBar, createN1Styles, useN1Breakpoint, useN1Styles } from '..';
import { CONTENT_MAX_WIDTH } from '../../constants';

export type AdminScreenProps = {
  /** Fixed above the scrolling content, e.g. <DetailHeader />. */
  header?: ReactNode;
  /** Phones only: buttons pinned to the bottom (Create user, Save changes). */
  compactFooter?: ReactNode;
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
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: t.spacing.lg,
    padding: t.spacing.xxl,
  },
  compactContent: { padding: t.spacing.lg },
}));

/** Scrolling page body used by every admin screen. */
export function AdminScreen({
  header,
  compactFooter,
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
      {header}
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
      {isCompact && compactFooter && <N1BottomBar>{compactFooter}</N1BottomBar>}
    </View>
  );
}
