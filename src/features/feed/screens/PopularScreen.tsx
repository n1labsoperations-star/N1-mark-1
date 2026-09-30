import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaceholderScreen } from '../../../shared/components';

function PopularScreen() {
  const navigation = useNavigation();

  return (
    <PlaceholderScreen title="Popular">
      <Button
        title="Open details"
        onPress={() => navigation.navigate('Details', { id: 'popular' })}
      />
    </PlaceholderScreen>
  );
}

export default React.memo(PopularScreen);
