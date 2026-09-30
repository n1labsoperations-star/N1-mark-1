import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useN1Theme } from '../../../theme/N1ThemeProvider';
import type { N1Colors } from '../../../theme/themes';
import type { N1Radius, N1Spacing } from '../../../theme/tokens';

export type N1ViewBackground = keyof Pick<
  N1Colors,
  'background' | 'surface' | 'surfaceMuted' | 'surfaceInverse'
>;

export type N1ViewProps = ViewProps & {
  /** Lay children out horizontally. */
  row?: boolean;
  flex?: number;
  gap?: N1Spacing;
  padding?: N1Spacing;
  paddingHorizontal?: N1Spacing;
  paddingVertical?: N1Spacing;
  background?: N1ViewBackground;
  radius?: N1Radius;
  /** Draws the standard hairline border. */
  bordered?: boolean;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
};

/**
 * Layout box. Spacing, colour and radius props take token names, so screens
 * never need hard-coded numbers or colours.
 */
export function N1View({
  row,
  flex,
  gap,
  padding,
  paddingHorizontal,
  paddingVertical,
  background,
  radius,
  bordered,
  align,
  justify,
  wrap,
  style,
  ...rest
}: N1ViewProps) {
  const t = useN1Theme();
  const box: ViewStyle = {
    flexDirection: row ? 'row' : undefined,
    flex,
    gap: gap && t.spacing[gap],
    padding: padding && t.spacing[padding],
    paddingHorizontal: paddingHorizontal && t.spacing[paddingHorizontal],
    paddingVertical: paddingVertical && t.spacing[paddingVertical],
    backgroundColor: background && t.colors[background],
    borderRadius: radius && t.radius[radius],
    borderWidth: bordered ? t.borderWidth.hairline : undefined,
    borderColor: bordered ? t.colors.border : undefined,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : undefined,
  };
  return <View style={[box, style]} {...rest} />;
}
