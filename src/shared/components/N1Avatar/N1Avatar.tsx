import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  createN1Styles,
  useN1Styles,
  useN1Theme,
} from '../../../theme/N1ThemeProvider';
import type { N1Tone } from '../../../theme/themes';
import type { avatarSize } from '../../../theme/tokens';
import { N1Text } from '../N1Text/N1Text';

export type N1AvatarProps = {
  /** Initials are taken from the first two words, e.g. "Priya Sharma" → "PS". */
  name?: string;
  /** Exact text instead of initials, e.g. "HI" for a priority marker. */
  label?: string;
  size?: keyof typeof avatarSize;
  /** 'rounded' is the square-ish tile used for priority markers. */
  shape?: 'circle' | 'rounded';
  /** Without a tone the avatar is dark with white text. */
  tone?: N1Tone;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

const makeStyles = createN1Styles(t => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceInverse,
  },
  circle: { borderRadius: t.radius.pill },
  rounded: { borderRadius: t.radius.sm },
  sm: { width: t.avatarSize.sm, height: t.avatarSize.sm },
  md: { width: t.avatarSize.md, height: t.avatarSize.md },
  lg: { width: t.avatarSize.lg, height: t.avatarSize.lg },
}));

export const N1Avatar = React.memo(function N1AvatarComponent({
  name = '',
  label,
  size = 'md',
  shape = 'circle',
  tone,
  style,
  testID,
}: N1AvatarProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const text = label ?? getInitials(name);
  const toneColors = tone ? theme.colors.tone[tone] : undefined;
  return (
    <View
      testID={testID}
      accessibilityLabel={name || label}
      style={[
        styles.base,
        styles[shape],
        styles[size],
        toneColors && { backgroundColor: toneColors.background },
        style,
      ]}
    >
      <N1Text
        variant={size === 'lg' ? 'h2' : size === 'md' ? 'label' : 'caption'}
        weight="bold"
        color={toneColors ? undefined : 'inverse'}
        style={toneColors && { color: toneColors.foreground }}
      >
        {text}
      </N1Text>
    </View>
  );
});
N1Avatar.displayName = 'N1Avatar';
