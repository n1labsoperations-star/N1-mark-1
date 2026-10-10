import React from 'react';
import type { ReactNode } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardScrollView,
  N1Text,
  useN1Styles,
} from '../../../shared/components';
import { makeAuthMobileShellStyles } from '../styles';

// The black and purple N1 brand mark.
const BRAND_LOGO = require('../../../../assets/images/n1-logo.png');

type Props = {
  title: string;
  subtitle?: string;
  /** The form, under the heading. */
  children: ReactNode;
  /** Line under the card, e.g. "No account yet? Create one". */
  footer?: ReactNode;
};

/** Phone auth shell: centred logo and heading above the form. */
function AuthMobileShell({ title, subtitle, children, footer }: Props) {
  const styles = useN1Styles(makeAuthMobileShellStyles);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image
            source={BRAND_LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="N1"
            testID="auth-mobile-logo"
          />
          <View style={styles.heading}>
            <N1Text variant="h1" align="center">
              {title}
            </N1Text>
            {subtitle ? (
              <N1Text color="secondary" align="center">
                {subtitle}
              </N1Text>
            ) : null}
          </View>
        </View>
        {children}
        {footer}
      </KeyboardScrollView>
    </SafeAreaView>
  );
}

export default React.memo(AuthMobileShell);
