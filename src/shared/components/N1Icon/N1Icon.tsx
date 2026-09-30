import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useN1Theme } from '../../../theme/N1ThemeProvider';
import type { N1Colors } from '../../../theme/themes';
import { iconSize } from '../../../theme/tokens';

type Shape =
  | { d: string }
  | { cx: number; cy: number; r: number }
  | { x: number; y: number; width: number; height: number; rx?: number };

/** Outline icons on a 24×24 grid, matching the stroke style in the design. */
const icons = {
  'arrow-left': [{ d: 'm12 19-7-7 7-7' }, { d: 'M19 12H5' }],
  'arrow-right': [{ d: 'M5 12h14' }, { d: 'm12 5 7 7-7 7' }],
  'chevron-down': [{ d: 'm6 9 6 6 6-6' }],
  'chevron-up': [{ d: 'm18 15-6-6-6 6' }],
  'chevron-left': [{ d: 'm15 18-6-6 6-6' }],
  'chevron-right': [{ d: 'm9 18 6-6-6-6' }],
  close: [{ d: 'M18 6 6 18' }, { d: 'm6 6 12 12' }],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  'check-circle': [{ cx: 12, cy: 12, r: 10 }, { d: 'm9 12 2 2 4-4' }],
  plus: [{ d: 'M5 12h14' }, { d: 'M12 5v14' }],
  search: [{ cx: 11, cy: 11, r: 8 }, { d: 'm21 21-4.3-4.3' }],
  menu: [{ d: 'M4 6h16' }, { d: 'M4 12h16' }, { d: 'M4 18h16' }],
  eye: [
    {
      d: 'M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0',
    },
    { cx: 12, cy: 12, r: 3 },
  ],
  'eye-off': [
    {
      d: 'M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49',
    },
    { d: 'M14.08 14.16a3 3 0 0 1-4.24-4.24' },
    {
      d: 'M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14',
    },
    { d: 'm2 2 20 20' },
  ],
  trash: [
    { d: 'M3 6h18' },
    { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' },
    { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' },
    { d: 'M10 11v6' },
    { d: 'M14 11v6' },
  ],
  upload: [
    { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { d: 'm17 8-5-5-5 5' },
    { d: 'M12 3v12' },
  ],
  download: [
    { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { d: 'm7 10 5 5 5-5' },
    { d: 'M12 15V3' },
  ],
  edit: [
    {
      d: 'M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z',
    },
    { d: 'm15 5 4 4' },
  ],
  file: [
    { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { d: 'M14 2v4a2 2 0 0 0 2 2h4' },
  ],
  info: [{ cx: 12, cy: 12, r: 10 }, { d: 'M12 16v-4' }, { d: 'M12 8h.01' }],
  clock: [{ cx: 12, cy: 12, r: 10 }, { d: 'M12 6v6l4 2' }],
  calendar: [
    { x: 3, y: 4, width: 18, height: 18, rx: 2 },
    { d: 'M16 2v4' },
    { d: 'M8 2v4' },
    { d: 'M3 10h18' },
  ],
  lock: [
    { x: 3, y: 11, width: 18, height: 11, rx: 2 },
    { d: 'M7 11V7a5 5 0 0 1 10 0v4' },
  ],
  message: [
    { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ],
  printer: [
    {
      d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2',
    },
    { d: 'M6 9V2h12v7' },
    { x: 6, y: 14, width: 12, height: 8, rx: 1 },
  ],
  play: [{ d: 'M6 3l14 9-14 9V3z' }],
  pause: [
    { x: 14, y: 4, width: 4, height: 16, rx: 1 },
    { x: 6, y: 4, width: 4, height: 16, rx: 1 },
  ],
  dashboard: [
    { x: 3, y: 3, width: 7, height: 7, rx: 1 },
    { x: 14, y: 3, width: 7, height: 7, rx: 1 },
    { x: 14, y: 14, width: 7, height: 7, rx: 1 },
    { x: 3, y: 14, width: 7, height: 7, rx: 1 },
  ],
  users: [
    { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { cx: 9, cy: 7, r: 4 },
    { d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
    { d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  building: [
    { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z' },
    { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2' },
    { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2' },
    { d: 'M10 6h4' },
    { d: 'M10 10h4' },
    { d: 'M10 14h4' },
    { d: 'M10 18h4' },
  ],
  package: [
    { d: 'm7.5 4.27 9 5.15' },
    {
      d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z',
    },
    { d: 'm3.3 7 8.7 5 8.7-5' },
    { d: 'M12 22V12' },
  ],
  clipboard: [
    { x: 8, y: 2, width: 8, height: 4, rx: 1 },
    {
      d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
    },
    { d: 'm9 14 2 2 4-4' },
  ],
  wrench: [
    {
      d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    },
  ],
  receipt: [
    { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { d: 'M14 2v4a2 2 0 0 0 2 2h4' },
    { d: 'M10 9H8' },
    { d: 'M16 13H8' },
    { d: 'M16 17H8' },
  ],
  sidebar: [{ x: 3, y: 3, width: 18, height: 18, rx: 2 }, { d: 'M9 3v18' }],
  logout: [
    { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' },
    { d: 'm16 17 5-5-5-5' },
    { d: 'M21 12H9' },
  ],
  'circle-dot': [
    { cx: 12, cy: 12, r: 10 },
    { cx: 12, cy: 12, r: 3 },
  ],
  scan: [
    { d: 'M3 7V5a2 2 0 0 1 2-2h2' },
    { d: 'M17 3h2a2 2 0 0 1 2 2v2' },
    { d: 'M21 17v2a2 2 0 0 1-2 2h-2' },
    { d: 'M7 21H5a2 2 0 0 1-2-2v-2' },
    { d: 'M7 12h10' },
  ],
  flash: [
    {
      d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
    },
  ],
  mic: [
    { x: 9, y: 2, width: 6, height: 13, rx: 3 },
    { d: 'M19 10v2a7 7 0 0 1-14 0v-2' },
    { d: 'M12 19v3' },
  ],
  camera: [
    {
      d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z',
    },
    { cx: 12, cy: 13, r: 3 },
  ],
  'x-circle': [
    { cx: 12, cy: 12, r: 10 },
    { d: 'm15 9-6 6' },
    { d: 'm9 9 6 6' },
  ],
  user: [
    { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
    { cx: 12, cy: 7, r: 4 },
  ],
} satisfies Record<string, Shape[]>;

export type N1IconName = keyof typeof icons;

export const n1IconNames = Object.keys(icons) as N1IconName[];

export type N1IconColor =
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textInverse'
  | 'onPrimary'
  | 'danger';

export type N1IconProps = {
  name: N1IconName;
  size?: keyof typeof iconSize;
  /** A theme colour name. Defaults to textPrimary. */
  color?: N1IconColor;
  /** Overrides `color` with an exact value, e.g. a tone colour. */
  tintColor?: string;
  testID?: string;
};

function colorFor(colors: N1Colors, color: N1IconColor): string {
  return colors[color];
}

export function N1Icon({
  name,
  size = 'md',
  color = 'textPrimary',
  tintColor,
  testID,
}: N1IconProps) {
  const theme = useN1Theme();
  const px = iconSize[size];
  const stroke = tintColor ?? colorFor(theme.colors, color);
  const shapes: Shape[] = icons[name];
  return (
    <Svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={testID}
    >
      {shapes.map((shape, index) => {
        if ('d' in shape) {
          return <Path key={index} d={shape.d} />;
        }
        if ('r' in shape) {
          return <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />;
        }
        return (
          <Rect
            key={index}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx}
          />
        );
      })}
    </Svg>
  );
}
