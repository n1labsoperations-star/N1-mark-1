import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { N1BottomBar, createN1Styles, useN1Styles } from '..';

export type UserScreenProps = {
  /** Fixed above the scrolling content, e.g. <N1Header />. */
  header?: ReactNode;
  /** Buttons pinned to the bottom (Save changes, Create Job Card). */
  footer?: ReactNode;
  children: ReactNode;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.surface },
  scroll: { flex: 1 },
  content: {
    width: '100%',
    // Phone-sized column, centred on wide screens.
    maxWidth: t.breakpoints.tablet,
    alignSelf: 'center',
    gap: t.spacing.lg,
    padding: t.spacing.lg,
  },
}));

/** Scrolling page body for the shop-floor (non-admin) screens. */
export function UserScreen({
  header,
  footer,
  children,
  testID,
}: UserScreenProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.root} testID={testID}>
      {header}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer && <N1BottomBar>{footer}</N1BottomBar>}
    </View>
  );
}
