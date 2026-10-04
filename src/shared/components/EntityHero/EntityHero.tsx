import type { ReactNode } from 'react';
import { View } from 'react-native';
import {
  AvatarPicker,
  N1Avatar,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '..';

export type EntityHeroProps = {
  name: string;
  /** e.g. "Production Supervisor · ABC Engineering Pvt Ltd". */
  subtitle?: string;
  /** Role / status badges; shown under the name on phones. */
  badges?: ReactNode;
  /** Button row (Edit details, Message…). */
  actions?: ReactNode;
  /** A photo or logo shown in place of the initials. */
  avatarUri?: string;
  /** Makes the avatar a button (e.g. change the logo); a camera badge shows. */
  onAvatarPress?: () => void;
  avatarLabel?: string;
  /** Spinner over the avatar while a new image saves. */
  avatarLoading?: boolean;
  testID?: string;
};

const makeStyles = createN1Styles(t => ({
  root: { gap: t.spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg },
  text: { flex: 1, gap: t.spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
}));

/** Large avatar, name and actions at the top of a detail screen. */
export function EntityHero({
  name,
  subtitle,
  badges,
  actions,
  avatarUri,
  onAvatarPress,
  avatarLabel,
  avatarLoading = false,
  testID,
}: EntityHeroProps) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.identity}>
        {onAvatarPress ? (
          <AvatarPicker
            name={name}
            imageUri={avatarUri}
            onPress={onAvatarPress}
            accessibilityLabel={avatarLabel ?? name}
            loading={avatarLoading}
            testID={testID && `${testID}-avatar`}
          />
        ) : (
          <N1Avatar name={name} size="lg" imageUri={avatarUri} />
        )}
        <View style={styles.text}>
          <N1Text variant="h2">{name}</N1Text>
          {subtitle && (
            <N1Text variant="small" color="secondary">
              {subtitle}
            </N1Text>
          )}
          {isCompact && badges && <View style={styles.badges}>{badges}</View>}
        </View>
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}
