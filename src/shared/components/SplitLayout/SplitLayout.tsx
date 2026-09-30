import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '..';
import { ASIDE_WIDTH } from '../../constants';

export type SplitLayoutProps = {
  children: ReactNode;
  /** Right-hand column on wide screens; below the main content on phones. */
  aside?: ReactNode;
};

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.lg },
  column: { gap: t.spacing.lg },
  main: { flex: 1, gap: t.spacing.lg },
  aside: { width: ASIDE_WIDTH, gap: t.spacing.lg },
}));

/** Main panel with a side column (detail screens). */
export function SplitLayout({ children, aside }: SplitLayoutProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  if (isCompact || !aside) {
    return (
      <View style={styles.column}>
        {children}
        {aside}
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <View style={styles.main}>{children}</View>
      <View style={styles.aside}>{aside}</View>
    </View>
  );
}
