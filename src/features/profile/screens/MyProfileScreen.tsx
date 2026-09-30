import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Badge,
  N1Button,
  N1Card,
  N1ConfirmDialog,
  N1DetailGrid,
  N1Divider,
  N1IconButton,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import {
  ActivityCard,
  AdminScreen,
  AsyncContent,
  DetailHeader,
  EntityHero,
  SplitLayout,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useToggle } from '../../../shared/hooks';
import { formatDate } from '../../../shared/utils';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';

const makeStyles = createN1Styles(t => ({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  section: { gap: t.spacing.md },
  grow: { flex: 1 },
}));

export function MyProfileScreen({ navigation }: AdminScreenProps<'MyProfile'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { profile, organization, status, error, reload, logout } = useSession();
  const [editOpen, openEdit, closeEdit] = useToggle(false);
  const [passwordOpen, openPassword, closePassword] = useToggle(false);
  const [logoutOpen, openLogout, closeLogout] = useToggle(false);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const confirmLogout = useCallback(() => {
    closeLogout();
    logout();
  }, [closeLogout, logout]);

  const orgLine = organization
    ? `${organization.name} · ${organization.code}`
    : '';

  const details = useMemo(() => {
    if (!profile) {
      return [];
    }
    return isCompact
      ? [
          { label: S.email, value: profile.email },
          { label: S.phone, value: profile.phone },
          { label: S.organization, value: orgLine },
        ]
      : [
          { label: S.email, value: profile.email },
          { label: S.phone, value: profile.phone },
          { label: S.designation, value: profile.designation },
          { label: S.organization, value: orgLine },
        ];
  }, [profile, isCompact, orgLine]);

  const logoutIcon = (
    <N1IconButton
      icon="logout"
      size="sm"
      variant="danger"
      accessibilityLabel={S.logout}
      onPress={openLogout}
    />
  );
  const header = (
    <DetailHeader title={S.title} onBack={goBack} compactRight={logoutIcon} />
  );

  if (!profile) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          {null}
        </AsyncContent>
      </AdminScreen>
    );
  }

  const roleBadge = (
    <N1Badge label={profile.role === 'admin' ? S.admin : S.user} tone="info" />
  );
  const statusBadge = <N1Badge label={S.active} tone="success" dot />;

  const hero = (
    <EntityHero
      name={profile.name}
      subtitle={
        isCompact
          ? profile.designation
          : [profile.designation, organization?.name]
              .filter(Boolean)
              .join(' · ')
      }
      badges={
        <>
          {roleBadge}
          {statusBadge}
        </>
      }
      actions={
        isCompact ? (
          <>
            <N1Button
              title={S.edit}
              leftIcon="edit"
              onPress={openEdit}
              style={styles.grow}
            />
            <N1Button
              title={S.password}
              leftIcon="lock"
              variant="secondary"
              onPress={openPassword}
              style={styles.grow}
            />
          </>
        ) : (
          <>
            <N1Button
              title={S.editProfile}
              leftIcon="edit"
              size="sm"
              onPress={openEdit}
              testID="edit-profile"
            />
            <N1Button
              title={S.changePassword}
              leftIcon="lock"
              variant="secondary"
              size="sm"
              onPress={openPassword}
              testID="change-password"
            />
          </>
        )
      }
    />
  );

  const aside = (
    <>
      {!isCompact && (
        <N1Card title={COMMON_STRINGS.account} icon="clipboard">
          <N1KeyValueList
            variant="plain"
            items={[
              { label: S.role, value: roleBadge },
              { label: S.status, value: statusBadge },
              { label: S.memberSince, value: formatDate(profile.memberSince) },
            ]}
          />
        </N1Card>
      )}
      <ActivityCard items={profile.activity} />
    </>
  );

  return (
    <AdminScreen header={header} testID="profile-screen">
      <SplitLayout aside={aside}>
        {isCompact ? (
          <>
            <N1Card>{hero}</N1Card>
            <N1Card title={S.contact}>
              <N1DetailGrid items={details} columns={1} />
            </N1Card>
          </>
        ) : (
          <N1Card padding="xxl">
            <View style={styles.section}>
              <View style={styles.topRow}>
                <N1Text variant="small" color="secondary">
                  {S.signedInAs}
                </N1Text>
                <N1Button
                  title={S.logout}
                  leftIcon="logout"
                  variant="secondary"
                  size="sm"
                  onPress={openLogout}
                  testID="logout"
                />
              </View>
              <N1Divider spacing="sm" />
              {hero}
              <N1Divider spacing="sm" />
              <N1DetailGrid items={details} />
            </View>
          </N1Card>
        )}
      </SplitLayout>

      <EditProfileModal
        visible={editOpen}
        profile={profile}
        onClose={closeEdit}
      />
      <ChangePasswordModal visible={passwordOpen} onClose={closePassword} />
      <N1ConfirmDialog
        visible={logoutOpen}
        title={S.logoutTitle}
        message={S.logoutMessage}
        confirmLabel={S.logout}
        icon="logout"
        onConfirm={confirmLogout}
        onCancel={closeLogout}
        testID="logout-dialog"
      />
    </AdminScreen>
  );
}
