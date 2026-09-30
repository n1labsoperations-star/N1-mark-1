import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import { DetailsScreen } from '../../features/feed';
import { N1GalleryScreen } from '../../features/gallery';
import type { RootStackParamList } from './types';
import { linking } from './linking';
import { fontFamily } from '../../theme/fonts';

// Headers, tab labels and drawer items read their fonts from the theme.
const theme: Theme = {
  ...DefaultTheme,
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: 'normal' },
    medium: { fontFamily: fontFamily.semiBold, fontWeight: 'normal' },
    bold: { fontFamily: fontFamily.bold, fontWeight: 'normal' },
    heavy: { fontFamily: fontFamily.bold, fontWeight: 'normal' },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <NavigationContainer theme={theme} linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="Components"
          component={N1GalleryScreen}
          options={{ title: 'N1 Components' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
