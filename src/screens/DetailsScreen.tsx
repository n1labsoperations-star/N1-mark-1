import { Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppText from '../components/AppText';
import PlaceholderScreen from '../components/PlaceholderScreen';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

function DetailsScreen({ navigation, route }: Props) {
  return (
    <PlaceholderScreen title="Details">
      <AppText>Opened from: {route.params.id}</AppText>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </PlaceholderScreen>
  );
}

export default DetailsScreen;
