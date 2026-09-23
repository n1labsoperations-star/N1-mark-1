import { Text, type TextProps } from 'react-native';
import { fonts, type FontWeight } from '../theme/fonts';

type Props = TextProps & {
  weight?: FontWeight;
};

// Use instead of <Text> so every label gets Lato.
function AppText({ weight = 'regular', style, ...rest }: Props) {
  return <Text style={[fonts[weight], style]} {...rest} />;
}

export default AppText;
