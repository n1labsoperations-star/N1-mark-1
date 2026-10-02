import React from 'react';
import { ImageBackground, View } from 'react-native';
import { N1Text, useN1Styles } from '../../../shared/components';
import { AUTH_TAGLINE } from '../constants';
import { makeAuthHeroStyles } from '../styles';

// Hero photo; the tagline sits on a frosted glass card over it.
const HERO_IMAGE = require('../../../../assets/images/auth-hero.jpg');

/** Brand panel shown beside the auth forms on wider screens. */
function AuthHero() {
  const styles = useN1Styles(makeAuthHeroStyles);

  return (
    <ImageBackground
      source={HERO_IMAGE}
      resizeMode="cover"
      style={styles.hero}
      testID="auth-hero"
    >
      <View style={styles.overlay} />
      <View style={styles.glass} testID="auth-hero-glass">
        <N1Text
          variant="h3"
          weight="regular"
          color="inverse"
          style={styles.tagline}
        >
          {AUTH_TAGLINE}
        </N1Text>
      </View>
    </ImageBackground>
  );
}

export default React.memo(AuthHero);
