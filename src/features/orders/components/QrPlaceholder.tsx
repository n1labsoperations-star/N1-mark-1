import { memo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useN1Theme } from '../../../shared/components';

// A fixed 7×7 pattern that reads as "QR code"; the real code comes with the print backend.
const GRID = 7;
const CELL = 8;
const FILLED = new Set([
  0, 1, 2, 4, 5, 6, 7, 9, 11, 13, 14, 15, 16, 18, 19, 20, 22, 24, 26, 28, 29,
  30, 32, 33, 35, 37, 39, 42, 43, 44, 46, 47, 48,
]);

export const QrPlaceholder = memo(function QrPlaceholderComponent() {
  const { colors } = useN1Theme();
  const size = GRID * CELL;
  return (
    // Decorative until the real QR code exists, so hide it from screen readers.
    <View aria-hidden>
      <Svg width={size} height={size}>
        {Array.from({ length: GRID * GRID }, (_, i) =>
          FILLED.has(i) ? (
            <Rect
              key={i}
              x={(i % GRID) * CELL}
              y={Math.floor(i / GRID) * CELL}
              width={CELL}
              height={CELL}
              fill={colors.textPrimary}
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
});
