import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components';

function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <PlaceholderScreen title="Profile">
      <Button
        title="Open details"
        onPress={() => navigation.navigate('Details', { id: 'profile' })}
      />
    </PlaceholderScreen>
  );
}

export default ProfileScreen;
