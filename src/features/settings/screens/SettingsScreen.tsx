import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components';

function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <PlaceholderScreen title="Settings">
      <Button
        title="Open details"
        onPress={() => navigation.navigate('Details', { id: 'settings' })}
      />
    </PlaceholderScreen>
  );
}

export default SettingsScreen;
