import React from 'react';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useN1Breakpoint, useN1Styles } from '../../../shared/components';
import { makeAuthLayoutStyles } from '../styles';
import AuthHero from './AuthHero';

type Props = {
  children: ReactNode;
  /** Line under the form; pinned to the bottom on phones. */
  footer?: ReactNode;
  /** Allow a wider form, e.g. for two-column fields. */
  wide?: boolean;
};

/**
 * Shared shell for the auth screens: hero panel + form side by side on
 * tablet / desktop, a single scrolling column on phones.
 */
function AuthLayout({ children, footer, wide = false }: Props) {
  const styles = useN1Styles(makeAuthLayoutStyles);
  const { isCompact } = useN1Breakpoint();

  if (isCompact) {
    return (
      <SafeAreaView style={styles.compactSafeArea}>
        <ScrollView
          contentContainerStyle={styles.compactContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
          {footer}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.split}>
      <AuthHero />
      <ScrollView
        style={styles.formPane}
        contentContainerStyle={styles.formPaneContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formWidth, wide && styles.wideFormWidth]}>
          {children}
          {footer}
        </View>
      </ScrollView>
    </View>
  );
}

export default React.memo(AuthLayout);
