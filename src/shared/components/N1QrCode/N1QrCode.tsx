import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import qrcode from 'qrcode-generator';
import { useN1Theme } from '../../../theme/N1ThemeProvider';

export type N1QrCodeProps = {
  /** Text to encode; any characters (sent as UTF-8). */
  value: string;
  /** Rendered width and height; defaults to the qrCode.size token. */
  size?: number;
  /** Read out by screen readers, e.g. "QR code for WO #1042". */
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Turns a string into the byte string qrcode-generator expects. Its default
 * encoder keeps only the low byte of each character, so encode UTF-8 first.
 */
export function toUtf8Bytes(value: string): string {
  // encodeURIComponent writes UTF-8 as %XX escapes; turn each back into a byte.
  return encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

/**
 * The dark modules of a QR code for `value` as one SVG path, in module units,
 * offset by the quiet zone. Medium error correction survives print smudges.
 */
export function qrCodePath(
  value: string,
  quietZone: number,
): { path: string; modules: number } {
  const qr = qrcode(0, 'M');
  qr.addData(toUtf8Bytes(value), 'Byte');
  qr.make();
  const count = qr.getModuleCount();
  let path = '';
  // One rectangle per run of dark modules in a row: a shorter path, and no
  // anti-aliased seams between neighbouring squares.
  for (let row = 0; row < count; row += 1) {
    let col = 0;
    while (col < count) {
      if (!qr.isDark(row, col)) {
        col += 1;
        continue;
      }
      const start = col;
      while (col < count && qr.isDark(row, col)) {
        col += 1;
      }
      const run = col - start;
      path += `M${start + quietZone} ${row + quietZone}h${run}v1h-${run}z`;
    }
  }
  return { path, modules: count + quietZone * 2 };
}

export const N1QrCode = memo(function N1QrCodeComponent({
  value,
  size,
  accessibilityLabel,
  style,
  testID,
}: N1QrCodeProps) {
  const { colors, qrCode } = useN1Theme();
  const { path, modules } = useMemo(
    () => qrCodePath(value, qrCode.quietZone),
    [value, qrCode.quietZone],
  );
  const side = size ?? qrCode.size;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={style}
      testID={testID}
    >
      <Svg width={side} height={side} viewBox={`0 0 ${modules} ${modules}`}>
        <Rect width={modules} height={modules} fill={colors.qrBackground} />
        <Path d={path} fill={colors.qrForeground} />
      </Svg>
    </View>
  );
});
