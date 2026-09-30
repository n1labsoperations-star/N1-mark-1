/**
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { AppProviders } from './providers';
import RootNavigator from './navigation/RootNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AppProviders>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
