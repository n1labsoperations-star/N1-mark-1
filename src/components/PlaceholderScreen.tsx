import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';

type Props = {
  title: string;
  children?: ReactNode;
};

// Temporary layout shared by all screens until real designs land.
function PlaceholderScreen({ title, children }: Props) {
  return (
    <View style={styles.container}>
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
  },
});

export default PlaceholderScreen;
