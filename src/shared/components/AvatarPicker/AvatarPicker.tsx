import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { N1Avatar, N1Icon, createN1Styles, useN1Styles, useN1Theme } from '..';

export type AvatarPickerProps = {
  /** For the initials when there's no image. */
  name: string;
  imageUri?: string;
  onPress: () => void;
  /** e.g. "Change logo". */
  accessibilityLabel: string;
  /** Spinner over the avatar while a new image saves. */
  loading?: boolean;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  badge: {
    position: 'absolute',
    right: -t.spacing.xxs,
    bottom: -t.spacing.xxs,
    padding: t.spacing.xs,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.raised,
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.overlay,
  },
}));

/** Large avatar with a camera badge; pressing it changes the picture. */
export function AvatarPicker({
  name,
  imageUri,
  onPress,
  accessibilityLabel,
  loading = false,
  testID,
}: AvatarPickerProps) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={loading}
      testID={testID}
    >
      <N1Avatar name={name} size="lg" imageUri={imageUri} />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.textInverse} />
        </View>
      )}
      <View style={styles.badge}>
        <N1Icon name="camera" size="sm" />
      </View>
    </Pressable>
  );
}
