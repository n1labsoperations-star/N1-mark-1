import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import type { N1Tone } from '../../../theme/themes';
import { N1Text } from '../N1Text/N1Text';

export type N1ProgressBarProps = {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** Shown on the left above the bar, e.g. "Overall completion". */
  label?: string;
  /** Shows the percentage on the right. Defaults to true when there is a label. */
  showValue?: boolean;
  tone?: N1Tone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const TRACK_HEIGHT = 8;

const makeStyles = createN1Styles(t => ({
  container: { gap: t.spacing.xs + t.spacing.xxs },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: t.radius.pill },
}));

export const N1ProgressBar = React.memo(function N1ProgressBarComponent({
  value,
  label,
  showValue = Boolean(label),
  tone = 'info',
  style,
  testID,
}: N1ProgressBarProps) {
  const styles = useN1Styles(makeStyles);
  const fillColor = useN1Theme().colors.tone[tone].solid;
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <View
      testID={testID}
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      {(label || showValue) && (
        <View style={styles.header}>
          <N1Text variant="caption" color="secondary">
            {label}
          </N1Text>
          {showValue && (
            <N1Text variant="caption" weight="bold" color={tone}>
              {`${percent}%`}
            </N1Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  );
});
N1ProgressBar.displayName = 'N1ProgressBar';
