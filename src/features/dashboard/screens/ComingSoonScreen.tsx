import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { N1Text, useN1Styles } from '../../../shared/components';
import { MENU_ITEMS } from '../constants';
import { makeComingSoonScreenStyles } from '../styles';

/** Stand-in for sidebar sections that are not built yet. */
function ComingSoonScreen() {
  const styles = useN1Styles(makeComingSoonScreenStyles);
  const route = useRoute();
  const label =
    MENU_ITEMS.find(item => item.route === route.name)?.label ?? route.name;

  return (
    <View style={styles.root}>
      <N1Text variant="h1">{label}</N1Text>
      <N1Text color="secondary">This section is coming soon.</N1Text>
    </View>
  );
}

export default React.memo(ComingSoonScreen);
