import React from 'react';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { N1IconName } from '../N1Icon/N1Icon';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1IconButton } from '../N1IconButton/N1IconButton';
import { N1Logo } from '../N1Logo/N1Logo';
import { N1Text } from '../N1Text/N1Text';

export type N1HeaderProps = {
  title?: string;
  /**
   * default: white bar, left button + title (Order, Job card, Edit Profile)
   * brand: black bar with the N1 logo (home screens)
   * dark: title centred on a dark screen (Scan QR Code)
   */
  variant?: 'default' | 'brand' | 'dark';
  /** Usually 'chevron-left' (back) or 'close'. */
  leftIcon?: N1IconName;
  onLeftPress?: () => void;
  leftAccessibilityLabel?: string;
  /** Right-hand action, e.g. an edit or flash button. */
  right?: ReactNode;
  /** Pads for the status bar / notch. Defaults to true. */
  safeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    minHeight: t.controlHeight.lg + t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  default: {
    backgroundColor: t.colors.surface,
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  brand: { backgroundColor: t.colors.surfaceInverse },
  dark: { backgroundColor: t.colors.scannerBackground },
  title: { flex: 1 },
  side: {
    minWidth: t.controlHeight.sm,
    alignItems: 'center',
  },
  darkTitle: { color: t.colors.scannerForeground },
  spacer: { flex: 1 },
}));

/** Top bar for a screen. */
export const N1Header = React.memo(function N1HeaderComponent({
  title,
  variant = 'default',
  leftIcon,
  onLeftPress,
  leftAccessibilityLabel,
  right,
  safeArea = true,
  style,
  testID,
}: N1HeaderProps) {
  const styles = useN1Styles(makeStyles);
  const label =
    leftAccessibilityLabel ?? (leftIcon === 'close' ? 'Close' : 'Back');
  const leftButton = leftIcon && onLeftPress && (
    <N1IconButton
      icon={leftIcon}
      size="sm"
      accessibilityLabel={label}
      onPress={onLeftPress}
      variant={variant === 'dark' ? 'overlay' : 'secondary'}
    />
  );

  let content: ReactNode;
  if (variant === 'brand') {
    content = (
      <>
        <N1Logo size="sm" color="inverse" />
        <View style={styles.spacer} />
        {right}
      </>
    );
  } else if (variant === 'dark') {
    content = (
      <>
        <View style={styles.side}>{leftButton}</View>
        <N1Text
          variant="title"
          weight="bold"
          align="center"
          style={[styles.title, styles.darkTitle]}
        >
          {title}
        </N1Text>
        <View style={styles.side}>{right}</View>
      </>
    );
  } else {
    content = (
      <>
        {leftButton}
        <N1Text
          variant="h2"
          style={styles.title}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </N1Text>
        {right}
      </>
    );
  }

  const Container = safeArea ? SafeAreaView : View;
  return (
    <Container
      edges={safeArea ? ['top'] : undefined}
      style={[styles[variant], style]}
      testID={testID}
    >
      <View style={styles.base}>{content}</View>
    </Container>
  );
});
N1Header.displayName = 'N1Header';
