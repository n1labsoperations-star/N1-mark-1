import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import selection from '../../../../assets/icons/selection.json';

/**
 * Custom icons from the IcoMoon font (assets/fonts/icomoon.ttf). Glyph codes
 * come from assets/icons/selection.json, so after regenerating the font on
 * icomoon.io, replace both files and add any new names to IconName.
 */
const glyphs: Record<string, number> = Object.fromEntries(
  selection.icons.map(icon => [icon.properties.name, icon.properties.code]),
);

export type IconName = 'home';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

function Icon({ name, size = 24, color, style }: Props) {
  return (
    <Text
      style={[styles.glyph, { fontSize: size, lineHeight: size, color }, style]}
      accessible={false}
      selectable={false}
      allowFontScaling={false}
    >
      {String.fromCodePoint(glyphs[name])}
    </Text>
  );
}

const styles = StyleSheet.create({
  glyph: { fontFamily: 'icomoon' },
});

export default Icon;
