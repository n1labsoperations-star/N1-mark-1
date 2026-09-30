import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1ScanFrameProps = {
  /** Put the camera preview here; it fills the screen behind the frame. */
  children?: ReactNode;
  title?: string;
  message?: string;
  /** Underlined link at the bottom, e.g. "Enter code manually". */
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

const makeStyles = createN1Styles(t => {
  const { frameSize, cornerLength, cornerWidth, lineHeight } = t.scanner;
  const corner = {
    position: 'absolute',
    width: cornerLength,
    height: cornerLength,
    borderColor: t.colors.scannerForeground,
  } as const;
  return {
    screen: {
      flex: 1,
      backgroundColor: t.colors.scannerBackground,
      alignItems: 'center',
      padding: t.spacing.xxl,
    },
    centre: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.spacing.xxl,
    },
    frame: { width: frameSize, height: frameSize, justifyContent: 'center' },
    topLeft: {
      ...corner,
      top: 0,
      left: 0,
      borderTopWidth: cornerWidth,
      borderLeftWidth: cornerWidth,
      borderTopLeftRadius: t.radius.sm,
    },
    topRight: {
      ...corner,
      top: 0,
      right: 0,
      borderTopWidth: cornerWidth,
      borderRightWidth: cornerWidth,
      borderTopRightRadius: t.radius.sm,
    },
    bottomLeft: {
      ...corner,
      bottom: 0,
      left: 0,
      borderBottomWidth: cornerWidth,
      borderLeftWidth: cornerWidth,
      borderBottomLeftRadius: t.radius.sm,
    },
    bottomRight: {
      ...corner,
      bottom: 0,
      right: 0,
      borderBottomWidth: cornerWidth,
      borderRightWidth: cornerWidth,
      borderBottomRightRadius: t.radius.sm,
    },
    line: {
      height: lineHeight,
      marginHorizontal: t.spacing.md,
      backgroundColor: t.colors.scannerLine,
    },
    text: { alignItems: 'center', gap: t.spacing.xs },
    light: { color: t.colors.scannerForeground },
    link: {
      color: t.colors.scannerForeground,
      textDecorationLine: 'underline',
    },
    footer: { paddingVertical: t.spacing.md },
  };
});

/** QR viewfinder: corner brackets, scan line and instructions on black. */
export function N1ScanFrame({
  children,
  title = 'Align the QR code within the frame',
  message,
  actionLabel,
  onActionPress,
  style,
  testID,
}: N1ScanFrameProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View testID={testID} style={[styles.screen, style]}>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
      <View style={styles.centre}>
        <View style={styles.frame} accessibilityLabel="Scanner frame">
          {corners.map(c => (
            <View key={c} style={styles[c]} />
          ))}
          <View style={styles.line} />
        </View>
        <View style={styles.text}>
          <N1Text
            variant="title"
            weight="bold"
            align="center"
            style={styles.light}
          >
            {title}
          </N1Text>
          {message && (
            <N1Text variant="caption" align="center" style={styles.light}>
              {message}
            </N1Text>
          )}
        </View>
      </View>
      {actionLabel && onActionPress && (
        <Pressable
          accessibilityRole="link"
          onPress={onActionPress}
          style={styles.footer}
          hitSlop={8}
        >
          <N1Text variant="small" weight="semiBold" style={styles.link}>
            {actionLabel}
          </N1Text>
        </Pressable>
      )}
    </View>
  );
}
