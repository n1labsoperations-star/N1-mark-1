import { Pressable, View } from 'react-native';
import { createN1Styles, useN1Styles } from '../../../theme/N1ThemeProvider';
import { N1Text } from '../N1Text/N1Text';

export type N1SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Shown on the left, e.g. a permission name. */
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const TRACK_WIDTH_RATIO = 1.75;

const makeStyles = createN1Styles(t => {
  const trackHeight = t.iconSize.xl;
  const thumb = trackHeight - t.spacing.xs * 2;
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.md,
    },
    track: {
      width: trackHeight * TRACK_WIDTH_RATIO,
      height: trackHeight,
      borderRadius: t.radius.pill,
      padding: t.spacing.xs,
      backgroundColor: t.colors.border,
      alignItems: 'flex-start',
    },
    trackOn: { backgroundColor: t.colors.primary, alignItems: 'flex-end' },
    thumb: {
      width: thumb,
      height: thumb,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.surface,
    },
    thumbOn: { backgroundColor: t.colors.onPrimary },
    label: { flex: 1 },
    disabled: { opacity: t.opacity.disabled },
  };
});

/** On/off toggle (e.g. the permissions list). */
export function N1Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  accessibilityLabel,
  testID,
}: N1SwitchProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel ?? label}
      aria-checked={value}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.row, disabled && styles.disabled]}
    >
      {label && (
        <N1Text variant="small" style={styles.label}>
          {label}
        </N1Text>
      )}
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}
