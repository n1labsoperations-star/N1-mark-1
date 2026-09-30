import { memo } from 'react';
import { View } from 'react-native';
import {
  N1StatCard,
  createN1Styles,
  useN1Styles,
  type N1IconName,
  type N1Tone,
} from '..';

export type StatItem = {
  key: string;
  label: string;
  value: string | number;
  icon?: N1IconName;
  tone?: N1Tone;
};

export type StatGridProps = {
  items: readonly StatItem[];
  /** 'muted' uses the grey tile from the phone designs. */
  variant?: 'surface' | 'muted';
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md },
  muted: { backgroundColor: t.colors.surfaceMuted },
}));

/** Row of summary tiles that wraps to two per row on phones. */
export const StatGrid = memo(function StatGridComponent({
  items,
  variant = 'surface',
  testID,
}: StatGridProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.grid} testID={testID}>
      {items.map(item => (
        <N1StatCard
          key={item.key}
          label={item.label}
          value={item.value}
          icon={item.icon}
          tone={item.tone}
          style={variant === 'muted' && styles.muted}
          testID={`stat-${item.key}`}
        />
      ))}
    </View>
  );
});
