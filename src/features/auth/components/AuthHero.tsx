import React from 'react';
import { View } from 'react-native';
import { N1Logo, N1Text, useN1Styles } from '../../../shared/components';
import { makeAuthHeroStyles } from '../styles';

type Props = {
  tagline: string;
};

/** Dark brand panel shown beside the auth forms on wider screens. */
function AuthHero({ tagline }: Props) {
  const styles = useN1Styles(makeAuthHeroStyles);

  return (
    <View style={styles.hero}>
      <View style={styles.logo}>
        <N1Logo size="xl" color="inverse" />
      </View>
      <N1Text variant="h2" weight="regular" color="inverse">
        {tagline}
      </N1Text>
    </View>
  );
}

export default React.memo(AuthHero);
