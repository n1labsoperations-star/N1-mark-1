import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { useN1Theme } from '../../../shared/components';

/** Blank modules around the code, which scanners need to find it. */
export const QUIET_ZONE = 2;

/** One SVG path for every dark module: far fewer nodes than a rect each. */
export function qrPath(value: string): { path: string; modules: number } {
  const { size, data } = QRCode.create(value, {
    errorCorrectionLevel: 'M',
  }).modules;
  let path = '';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (data[row * size + col]) {
        path += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
  }
  return { path, modules: size + QUIET_ZONE * 2 };
}

/**
 * A scannable QR code for `value`. Dark on light in both themes, as
 * scanners expect.
 */
export const QrCode = memo(function QrCodeComponent({
  value,
  size,
  accessibilityLabel,
  flushLeft = false,
  testID,
}: {
  value: string;
  /** Width and height in px. */
  size: number;
  /**
   * Pull the code left by its quiet zone, so the dark squares (not the light
   * border) line up with text above it.
   */
  flushLeft?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const { colors } = useN1Theme();
  const { path, modules } = useMemo(() => qrPath(value), [value]);
  const quietZonePx = (size / modules) * QUIET_ZONE;
  return (
    <View
      style={flushLeft && { marginLeft: -quietZonePx }}
      accessible={!!accessibilityLabel}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`}>
        <Rect width={modules} height={modules} fill={colors.qrBackground} />
        <Path d={path} fill={colors.qrForeground} />
      </Svg>
    </View>
  );
});
