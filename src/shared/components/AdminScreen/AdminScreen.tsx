import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import {
  N1BottomBar,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../N1Modules';
import { CONTENT_MAX_WIDTH } from '../../constants';

export type AdminScreenProps = {
  /** Fixed above the scrolling content, e.g. <DetailHeader />. */
  header?: ReactNode;
  /** Phones only: buttons pinned to the bottom (Create user, Save changes). */
  compactFooter?: ReactNode;
  children: ReactNode;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  root: { flex: 1, backgroundColor: t.colors.background },
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
  return (
    <View style={styles.root} testID={testID}>
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
