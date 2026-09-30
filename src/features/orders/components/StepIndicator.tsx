import { memo } from 'react';
import { View } from 'react-native';
import { N1Text, createN1Styles, useN1Styles } from '../../../N1Modules';

const BAR_WIDTH = 24;
const BAR_HEIGHT = 4;

const makeStyles = createN1Styles(t => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
  },
  bars: { flexDirection: 'row', gap: t.spacing.xs },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.border,
  },
  active: { backgroundColor: t.colors.primary },
}));

type Props = { step: number; total: number; label: string };

/** "▬ ▭  Step 1 of 2 · …" under a multi-step form. */
export const StepIndicator = memo(function StepIndicatorComponent({
  step,
  total,
  label,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      aria-valuenow={step}
      aria-valuemax={total}
    >
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i + 1 === step && styles.active]} />
        ))}
      </View>
      <N1Text variant="caption" color="secondary">
        {label}
      </N1Text>
    </View>
  );
});
