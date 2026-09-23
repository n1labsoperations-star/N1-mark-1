import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../components/AppText';
import PlaceholderScreen from '../components/PlaceholderScreen';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  decrement,
  increment,
  incrementAsync,
} from '../features/counter/counterSlice';
import { fetchUsersRequest } from '../features/users/usersSlice';

// Temporary Redux Toolkit + Redux Saga demo; replace with the real feed later.
function LatestScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const counter = useAppSelector(state => state.counter);
  const users = useAppSelector(state => state.users);

  return (
    <PlaceholderScreen title="Latest">
      <AppText weight="semiBold">Count: {counter.value}</AppText>
      <View style={styles.row}>
        <Button title="-" onPress={() => dispatch(decrement())} />
        <Button title="+" onPress={() => dispatch(increment())} />
        <Button
          title={counter.isPending ? 'Waiting…' : '+1 after 1s (saga)'}
          disabled={counter.isPending}
          onPress={() => dispatch(incrementAsync())}
        />
      </View>

      <Button
        title="Load users (saga)"
        disabled={users.isLoading}
        onPress={() => dispatch(fetchUsersRequest())}
      />
      {users.isLoading && <ActivityIndicator />}
      {users.error && <AppText>{users.error}</AppText>}
      {users.items.map(user => (
        <AppText key={user.id}>{user.name}</AppText>
      ))}

      <Text>Test</Text>
      <Button
        title="Open details"
        onPress={() => navigation.navigate('Details', { id: 'latest' })}
      />
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default LatestScreen;
