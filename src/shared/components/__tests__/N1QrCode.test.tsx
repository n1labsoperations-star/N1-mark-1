import { N1QrCode, qrCodePath, toUtf8Bytes } from '..';
import { WIDE, render } from '../../testing/render';
import { byTestId } from '../../testing/testUtils';

const runsOn = (path: string, row: number) =>
  [...path.matchAll(/M(\d+) (\d+)h(\d+)/g)]
    .filter(m => Number(m[2]) === row)
    .map(m => [Number(m[1]), Number(m[3])]);

test('toUtf8Bytes encodes every character as UTF-8', () => {
  const bytes = (text: string) =>
    Array.from(toUtf8Bytes(text), c => c.charCodeAt(0));
  expect(bytes('WO #1')).toEqual([0x57, 0x4f, 0x20, 0x23, 0x31]);
  expect(bytes('ü')).toEqual([0xc3, 0xbc]);
  expect(bytes('₹')).toEqual([0xe2, 0x82, 0xb9]);
  expect(bytes('🔩')).toEqual([0xf0, 0x9f, 0x94, 0xa9]);
});

test('qrCodePath draws the finder patterns inside the quiet zone', () => {
  // A short code is a version 1 symbol: 21 modules plus a 2-module margin.
  const { path, modules } = qrCodePath('WO #1042', 2);
  expect(modules).toBe(25);
  // Top row of the top-left and top-right finder patterns: 7 dark modules.
  expect(runsOn(path, 2)).toEqual(
    expect.arrayContaining([
      [2, 7],
      [16, 7],
    ]),
  );
  // Nothing is drawn in the margin.
  expect(runsOn(path, 0)).toEqual([]);
  expect(runsOn(path, 1)).toEqual([]);
  // More text needs a bigger symbol.
  expect(qrCodePath('WO #1042\n'.repeat(10), 2).modules).toBeGreaterThan(25);
});

test('renders as a labelled image at the token size, or a given size', async () => {
  const root = await render(
    <N1QrCode value="WO #1042" accessibilityLabel="QR code" testID="qr" />,
    WIDE,
  );
  const qr = byTestId(root, 'qr');
  expect(qr.props.accessibilityRole).toBe('image');
  expect(qr.props.accessibilityLabel).toBe('QR code');
  const svg = qr.findAll(n => n.props.viewBox === '0 0 25 25')[0];
  expect(svg.props.width).toBe(128);

  const small = await render(
    <N1QrCode value="1042" size={64} accessibilityLabel="QR" testID="qr" />,
    WIDE,
  );
  const smallSvg = byTestId(small, 'qr').findAll(
    n => typeof n.props.viewBox === 'string',
  )[0];
  expect(smallSvg.props.width).toBe(64);
});
