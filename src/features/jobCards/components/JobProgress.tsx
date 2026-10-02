import { memo } from 'react';
import { View } from 'react-native';
import {
  N1ProgressBar,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { progressTone } from '../utils';

const makeStyles = createN1Styles(t => ({
  // Stretch across the table cell, which aligns its content to the start;
  // otherwise the flexible bar collapses to zero width.
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  bar: { flex: 1 },
  value: { minWidth: t.spacing.xxxl + t.spacing.md, textAlign: 'right' },
}));

/** Progress bar with its percentage on the right (list rows and cards). */
export const JobProgress = memo(function JobProgressComponent({
  value,
  testID,
}: {
  value: number;
  testID?: string;
}) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.row} testID={testID}>
      <N1ProgressBar
        value={value}
        tone={progressTone(value)}
        style={styles.bar}
      />
      <N1Text variant="small" weight="semiBold" style={styles.value}>
        {`${value}%`}
      </N1Text>
    </View>
  );
});
