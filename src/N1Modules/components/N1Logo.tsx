import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../theme/N1ThemeProvider';
import { N1Text } from './N1Text';

export type N1LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  /** 'inverse' for dark bars (white logo). */
  color?: 'primary' | 'inverse';
  testID?: string;
};

const STAR_POINTS = 8;
const STAR_INNER_RATIO = 0.35;
const STAR_SIZE_RATIO = 0.65;

/** Points for an eight-pointed star in a 24×24 box. */
function starPoints(): string {
  const centre = 12;
  const points: string[] = [];
  for (let i = 0; i < STAR_POINTS * 2; i++) {
    const r = i % 2 === 0 ? centre : centre * STAR_INNER_RATIO;
    const angle = (Math.PI * i) / STAR_POINTS - Math.PI / 2;
    points.push(
      `${(centre + r * Math.cos(angle)).toFixed(2)},${(
        centre +
        r * Math.sin(angle)
      ).toFixed(2)}`,
    );
  }
  return points.join(' ');
}

const STAR = starPoints();

const variantFor = { sm: 'h3', md: 'h2', lg: 'display' } as const;

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.xxs },
}));

/** The "N1✱" wordmark. */
export function N1Logo({
  size = 'md',
  color = 'primary',
  testID,
}: N1LogoProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const variant = variantFor[size];
  const starSize = theme.typography[variant].fontSize * STAR_SIZE_RATIO;
  const fill =
    color === 'inverse' ? theme.colors.textInverse : theme.colors.textPrimary;
  return (
    <View
      style={styles.row}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="N1"
    >
      <N1Text variant={variant} color={color}>
        N1
      </N1Text>
      <Svg width={starSize} height={starSize} viewBox="0 0 24 24">
        <Polygon points={STAR} fill={fill} />
      </Svg>
    </View>
  );
}
