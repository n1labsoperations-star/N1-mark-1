import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  N1Text,
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '..';
import { DONUT_SIZE, DONUT_THICKNESS } from '../../constants';

export type DonutSegment = {
  key: string;
  value: number;
  color: string;
  label: string;
};

export type DonutChartProps = {
  segments: readonly DonutSegment[];
  size?: keyof typeof DONUT_SIZE;
  /** Big number in the middle, e.g. 30. */
  centerValue?: string | number;
  /** Small text above the number, e.g. "Total". */
  centerLabel?: string;
  /** Small text below the number, e.g. "orders". */
  centerCaption?: string;
  testID?: string;
};

/** Gap between segments, as a fraction of the circumference. */
const SEGMENT_GAP = 0.004;

const makeStyles = createN1Styles(() => ({
  root: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
}));

/** Ring chart for shares of a total (customer order distribution). */
export const DonutChart = memo(function DonutChartComponent({
  segments,
  size = 'md',
  centerValue,
  centerLabel,
  centerCaption,
  testID,
}: DonutChartProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const diameter = DONUT_SIZE[size];
  const thickness = DONUT_THICKNESS[size];
  const r = (diameter - thickness) / 2;
  const c = diameter / 2;
  const circumference = 2 * Math.PI * r;

  const arcs = useMemo(() => {
    const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    if (total === 0) {
      return [];
    }
    let offset = 0;
    return segments
      .filter(s => s.value > 0)
      .map(s => {
        const share = s.value / total;
        const gap = segments.length > 1 ? SEGMENT_GAP : 0;
        const length = Math.max(0, share - gap) * circumference;
        const arc = {
          key: s.key,
          color: s.color,
          length,
          offset: -offset * circumference,
        };
        offset += share;
        return arc;
      });
  }, [segments, circumference]);

  const summary = segments.map(s => `${s.label} ${s.value}`).join(', ');

  return (
    <View
      style={[styles.root, { width: diameter, height: diameter }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={[centerLabel, centerValue, centerCaption, summary]
        .filter(v => v !== undefined && v !== '')
        .join(' ')}
      testID={testID}
    >
      <Svg width={diameter} height={diameter}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={theme.colors.surfaceMuted}
          strokeWidth={thickness}
          fill="none"
        />
        <G transform={`rotate(-90 ${c} ${c})`}>
          {arcs.map(arc => (
            <Circle
              key={arc.key}
              cx={c}
              cy={c}
              r={r}
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={arc.offset}
              fill="none"
            />
          ))}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {centerLabel && (
          <N1Text variant="overline" weight="regular">
            {centerLabel}
          </N1Text>
        )}
        {centerValue !== undefined && (
          <N1Text variant={size === 'sm' ? 'h3' : 'stat'}>{centerValue}</N1Text>
        )}
        {centerCaption && (
          <N1Text variant="caption" color="secondary">
            {centerCaption}
          </N1Text>
        )}
      </View>
    </View>
  );
});
