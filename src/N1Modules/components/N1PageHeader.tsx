import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { createN1Styles, useN1Styles } from '../theme/N1ThemeProvider';
import { N1Text } from './N1Text';

export type N1PageHeaderProps = {
  title: string;
  /** e.g. "3 active · 5 total". */
  subtitle?: string;
  /** e.g. a search icon button. */
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  titles: { flex: 1, gap: t.spacing.xxs },
}));

/** Large page title with a count line (My Jobs, QC). */
export function N1PageHeader({
  title,
  subtitle,
  right,
  style,
}: N1PageHeaderProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titles}>
        <N1Text variant="h2" accessibilityRole="header">
          {title}
        </N1Text>
        {subtitle && (
          <N1Text variant="small" color="secondary">
            {subtitle}
          </N1Text>
        )}
      </View>
      {right}
    </View>
  );
}
