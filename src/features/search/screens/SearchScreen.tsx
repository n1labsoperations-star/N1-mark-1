import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components';

function SearchScreen() {
  const navigation = useNavigation();

  return (
    <PlaceholderScreen title="Search">
      <Button
        title="Open details"
        onPress={() => navigation.navigate('Details', { id: 'search' })}
      />
    </PlaceholderScreen>
  );
}

export default React.memo(SearchScreen);
