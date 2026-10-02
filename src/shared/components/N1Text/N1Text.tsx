import React from 'react';
import { Text, type TextProps } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import type { N1Tone } from '../../../theme/themes';
import {
  typography,
  type N1FontWeight,
  type N1TextVariant,
} from '../../../theme/tokens';

export type N1TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'onPrimary'
  | N1Tone;

export type N1TextProps = TextProps & {
  /** Size, line height and default weight. Defaults to 'body'. */
  variant?: N1TextVariant;
  /** Overrides the variant's weight. */
  weight?: N1FontWeight;
  color?: N1TextColor;
  align?: 'left' | 'center' | 'right';
};

const variants = Object.keys(typography) as N1TextVariant[];

const makeStyles = createN1Styles(t => ({
  ...(Object.fromEntries(
    variants.map(v => [
      v,
      {
        fontSize: t.typography[v].fontSize,
        lineHeight: t.typography[v].lineHeight,
        fontFamily: t.fontFamily[t.typography[v].weight],
      },
    ]),
  ) as Record<N1TextVariant, object>),
  overlineCase: {
    textTransform: 'uppercase',
    letterSpacing: t.overlineLetterSpacing,
  },
  regular: { fontFamily: t.fontFamily.regular },
  semiBold: { fontFamily: t.fontFamily.semiBold },
  bold: { fontFamily: t.fontFamily.bold },
  primary: { color: t.colors.textPrimary },
  secondary: { color: t.colors.textSecondary },
  tertiary: { color: t.colors.textTertiary },
  inverse: { color: t.colors.textInverse },
  onPrimary: { color: t.colors.onPrimary },
  neutral: { color: t.colors.tone.neutral.solid },
  success: { color: t.colors.tone.success.solid },
  info: { color: t.colors.tone.info.solid },
  warning: { color: t.colors.tone.warning.solid },
  danger: { color: t.colors.tone.danger.solid },
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
}));

export const N1Text = React.memo(function N1TextComponent({
  variant = 'body',
  weight,
  color,
  align,
  style,
  ...rest
}: N1TextProps) {
  const styles = useN1Styles(makeStyles);
  const defaultColor = variant === 'overline' ? 'secondary' : 'primary';
  return (
    <Text
      style={[
        styles[variant],
        variant === 'overline' && styles.overlineCase,
        weight && styles[weight],
        styles[color ?? defaultColor],
        align && styles[align],
        style,
      ]}
      {...rest}
    />
  );
});
N1Text.displayName = 'N1Text';
