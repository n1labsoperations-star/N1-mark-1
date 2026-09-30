import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useN1Theme } from '../../../theme/N1ThemeProvider';
import type { N1Spacing } from '../../../theme/tokens';

export type N1DividerProps = {
  vertical?: boolean;
  /** Space on both sides of the line. */
  spacing?: N1Spacing;
  style?: StyleProp<ViewStyle>;
};

export const N1Divider = React.memo(function N1DividerComponent({
  vertical = false,
  spacing = 'none',
  style,
}: N1DividerProps) {
  const t = useN1Theme();
  const gap = t.spacing[spacing];
  const line: ViewStyle = vertical
    ? {
        width: t.borderWidth.hairline,
        alignSelf: 'stretch',
        marginHorizontal: gap,
        backgroundColor: t.colors.border,
      }
    : {
        height: t.borderWidth.hairline,
        alignSelf: 'stretch',
        marginVertical: gap,
        backgroundColor: t.colors.border,
      };
  return <View accessible={false} style={[line, style]} />;
});
N1Divider.displayName = 'N1Divider';
