import { memo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../shared/components';
import { DRAWING_PREVIEW_HEIGHT } from '../../../shared/constants';
import { ORDER_STRINGS } from '../constants';

// Placeholder part outline in a 200×120 viewBox, until real drawing thumbnails exist.
const VIEW = { w: 200, h: 120 } as const;
const PART = { x: 58, y: 22, w: 84, h: 62, hole: 13 } as const;
const DIM_FONT = 7;

const makeStyles = createN1Styles(t => ({
  box: {
    height: DRAWING_PREVIEW_HEIGHT,
    borderRadius: t.radius.md,
    borderWidth: t.borderWidth.hairline,
    borderColor: t.colors.border,
    backgroundColor: t.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/** Simple technical-drawing thumbnail for the order screen. */
export const DrawingPreview = memo(function DrawingPreviewComponent({
  drawingNumber,
}: {
  drawingNumber: string;
}) {
  const styles = useN1Styles(makeStyles);
  const { colors } = useN1Theme();
  const stroke = colors.textPrimary;
  const muted = colors.textSecondary;
  const cx = PART.x + PART.w / 2;
  const cy = PART.y + PART.h / 2;
  const dimY = PART.y + PART.h + 14;
  const dimX = PART.x + PART.w + 12;
  return (
    <View
      style={styles.box}
      accessible
      accessibilityRole="image"
      accessibilityLabel={ORDER_STRINGS.details.drawingA11y(drawingNumber)}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}>
        <Rect
          x={PART.x}
          y={PART.y}
          width={PART.w}
          height={PART.h}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={PART.hole}
          stroke={stroke}
          strokeWidth={1}
          fill="none"
        />
        <SvgText
          x={cx}
          y={cy + DIM_FONT / 3}
          fontSize={DIM_FONT - 2}
          fill={muted}
          textAnchor="middle"
        >
          ⌀28
        </SvgText>
        <Line
          x1={PART.x}
          y1={dimY}
          x2={PART.x + PART.w}
          y2={dimY}
          stroke={muted}
          strokeWidth={0.8}
        />
        <SvgText
          x={cx}
          y={dimY + DIM_FONT + 2}
          fontSize={DIM_FONT - 1}
          fill={muted}
          textAnchor="middle"
        >
          80 mm
        </SvgText>
        <Line
          x1={dimX}
          y1={PART.y}
          x2={dimX}
          y2={PART.y + PART.h}
          stroke={muted}
          strokeWidth={0.8}
        />
        <SvgText x={dimX + 5} y={cy} fontSize={DIM_FONT - 1} fill={muted}>
          60
        </SvgText>
      </Svg>
    </View>
  );
});
