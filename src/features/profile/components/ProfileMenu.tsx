import { useCallback, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import {
  AvatarPicker,
  N1Badge,
  N1ConfirmDialog,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
  useN1Theme,
  type N1IconName,
} from '../../../shared/components';
import { useOnSettled, useToggle } from '../../../shared/hooks';
import { pickImage } from '../../../services/files/pickImage';
import { useAuthSession } from '../../auth';
import { ROLE_LABELS } from '../../auth/constants';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';
import type { MyProfile, ProfileSection } from '../types';

const ROWS: { key: ProfileSection; label: string; icon: N1IconName }[] = [
  { key: 'organization', label: S.menu.organization, icon: 'building' },
  { key: 'account', label: S.menu.account, icon: 'user' },
  { key: 'security', label: S.menu.security, icon: 'lock' },
  { key: 'address', label: S.menu.address, icon: 'map-pin' },
];

/** Extra black above the page, so pulling it down shows no white. */
const BACKDROP_OVERSCROLL = 1000;

const makeStyles = createN1Styles(t => ({
  root: { flexGrow: 1, gap: t.spacing.xl },
  // Black from the top bar, down behind the top half of the identity card.
  // Bleeds past the page padding, and above it for pull-down overscroll.
  backdrop: {
    position: 'absolute',
    top: -(t.spacing.lg + BACKDROP_OVERSCROLL),
    left: -t.spacing.lg,
    right: -t.spacing.lg,
    backgroundColor: t.colors.surfaceInverse,
  },
  // A white card like the dashboard's stat cards.
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
    padding: t.spacing.lg,
    borderRadius: t.radius.compact,
    backgroundColor: t.colors.surface,
    boxShadow: t.shadow.soft,
  },
  identityText: { flex: 1, gap: t.spacing.xxs },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    marginTop: t.spacing.xs,
  },
  rows: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
    minHeight: t.controlHeight.lg + t.spacing.sm,
  },
  divider: {
    borderBottomWidth: t.borderWidth.hairline,
    borderBottomColor: t.colors.border,
  },
  label: { flex: 1 },
  pressed: { opacity: t.opacity.pressed },
}));

type Props = {
  profile: MyProfile;
  onOpen: (section: ProfileSection) => void;
};

/**
 * Phones: My profile as a menu. The person's photo (tap to change), name,
 * email, role and status, a row for
 * each settings screen, and Log out at the bottom.
 */
export function ProfileMenu({ profile, onOpen }: Props) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const { logout, updateProfile, saving } = useSession();
  const [photoSaving, setPhotoSaving] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const onCardLayout = useCallback(
    (e: LayoutChangeEvent) => setCardHeight(e.nativeEvent.layout.height),
    [],
  );

  // Same as the profile summary: the photo saves as soon as it's picked.
  const changePhoto = useCallback(async () => {
    const photo = await pickImage('photo', 'photo.png');
    if (photo) {
      setPhotoSaving(true);
      updateProfile({ photo });
    }
  }, [updateProfile]);
  useOnSettled(saving, null, () => setPhotoSaving(false));
  const { signOut } = useAuthSession();
  const [logoutOpen, openLogout, closeLogout] = useToggle(false);

  // Same as the sidebar's Log out: the root navigator then shows Login.
  const confirmLogout = useCallback(() => {
    closeLogout();
    logout();
    signOut();
  }, [closeLogout, logout, signOut]);

  const row = (
    key: string,
    label: string,
    icon: N1IconName,
    onPress: () => void,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        key !== 'logout' && styles.divider,
        pressed && styles.pressed,
      ]}
      testID={`profile-menu-${key}`}
    >
      <N1Icon name={icon} size="md" color="textPrimary" />
      <N1Text style={styles.label}>{label}</N1Text>
      {key !== 'logout' && (
        <N1Icon name="chevron-right" size="sm" color="textTertiary" />
      )}
    </Pressable>
  );

  return (
    <View style={styles.root} testID="profile-menu">
      <View
        pointerEvents="none"
        style={[
          styles.backdrop,
          {
            height: BACKDROP_OVERSCROLL + theme.spacing.lg + cardHeight / 2,
          },
        ]}
      />
      <View style={styles.identity} onLayout={onCardLayout}>
        <AvatarPicker
          name={profile.name}
          imageUri={profile.photo?.uri}
          onPress={changePhoto}
          accessibilityLabel={S.changePhoto}
          loading={photoSaving}
          testID="profile-photo"
        />
        <View style={styles.identityText}>
          <N1Text variant="h3" numberOfLines={1}>
            {profile.name}
          </N1Text>
          <N1Text variant="small" color="secondary" numberOfLines={1}>
            {profile.email}
          </N1Text>
          <View style={styles.badges}>
            <N1Badge label={ROLE_LABELS[profile.role]} tone="info" />
            <N1Badge label={S.active} tone="success" dot />
          </View>
        </View>
      </View>
      <View style={styles.rows}>
        {ROWS.map(item =>
          row(item.key, item.label, item.icon, () => onOpen(item.key)),
        )}
      </View>
      {row('logout', S.logout, 'logout', openLogout)}
      <N1ConfirmDialog
        visible={logoutOpen}
        title={S.logoutTitle}
        message={S.logoutMessage}
        confirmLabel={S.logout}
        icon="logout"
        onConfirm={confirmLogout}
        onCancel={closeLogout}
        testID="profile-logout-dialog"
      />
    </View>
  );
}
