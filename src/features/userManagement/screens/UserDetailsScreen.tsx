import { useCallback, useMemo } from 'react';
import { Linking, View } from 'react-native';
import {
  N1Button,
  N1Card,
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
  ComingSoon,
  DetailHeader,
  EntityHero,
  SplitLayout,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useConfirmDelete, useToggle } from '../../../shared/hooks';
import { formatDate } from '../../../shared/utils';
import { useSession } from '../../profile';
import { AttachmentList } from '../components/AttachmentList';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { PermissionsCard } from '../components/PermissionsCard';
import { RoleBadge, UserStatusBadge } from '../components/UserBadges';
import { UserFormModal } from '../components/UserFormModal';
import { USER_STRINGS } from '../constants';
import { useUser } from '../hooks/useUsers';
import type { AdminUser, UserPermissionKey } from '../types';

const D = USER_STRINGS.details;

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

export function UserDetailsScreen({
  route,
  navigation,
}: AdminScreenProps<'UserDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { organization } = useSession();
  const {
    user,
    status,
    error,
    reload,
    update,
    saving,
    remove,
    deletingId,
    deleteError,
  } = useUser(route.params.userId);
  const [formOpen, openForm, closeForm] = useToggle(false);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const deletion = useConfirmDelete<AdminUser>(
    remove,
    deletingId,
    deleteError,
    goBack,
  );

  const setPermission = useCallback(
    (key: UserPermissionKey, value: boolean) => {
      if (user) {
        update(user.id, { permissions: { ...user.permissions, [key]: value } });
      }
    },
    [user, update],
  );

  const toggleActive = useCallback(() => {
    if (user) {
      update(user.id, {
        status: user.status === 'active' ? 'inactive' : 'active',
      });
    }
  }, [user, update]);

  const message = useCallback(() => {
    if (user) {
      Linking.openURL(`mailto:${user.email}`).catch(() => undefined);
    }
  }, [user]);

  const orgName = organization?.name ?? '';

  const contactItems = useMemo(() => {
    if (!user) {
      return [];
    }
    const base = [
      { label: D.email, value: user.email },
      { label: D.phone, value: user.phone },
      { label: D.designation, value: user.designation },
    ];
    return isCompact
      ? [
          ...base,
          { label: D.organization, value: orgName },
          { label: D.joinedLabel, value: formatDate(user.joinedAt) },
        ]
      : [...base, { label: D.department, value: user.department }];
  }, [user, isCompact, orgName]);

  const header = <DetailHeader title={D.title} onBack={goBack} />;

  if (!user) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="user" title={D.title} message={D.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const deleteButton = (
    <N1IconButton
      icon="trash"
      variant="danger"
      accessibilityLabel={USER_STRINGS.a11y.delete(user.name)}
      onPress={() => deletion.request(user)}
    />
  );

  const actions = isCompact ? (
    <>
      <N1Button
        title={COMMON_STRINGS.edit}
        leftIcon="edit"
        onPress={openForm}
        style={styles.grow}
      />
      <N1Button
        title={D.reset}
        leftIcon="lock"
        variant="secondary"
        onPress={openForm}
        style={styles.grow}
      />
    </>
  ) : (
    <>
      <N1Button
        title={D.editDetails}
        leftIcon="edit"
        size="sm"
        onPress={openForm}
        testID="edit-user"
      />
      <N1Button
        title={D.message}
        leftIcon="message"
        variant="secondary"
        size="sm"
        onPress={message}
      />
      <N1Button
        title={D.resetPassword}
        leftIcon="lock"
        variant="secondary"
        size="sm"
        onPress={openForm}
      />
      {deleteButton}
    </>
  );

  const hero = (
    <EntityHero
      name={user.name}
      subtitle={
        isCompact
          ? user.designation
          : [user.designation, orgName].filter(Boolean).join(' · ')
      }
      badges={
        <>
          <RoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
        </>
      }
      actions={actions}
    />
  );

  const aside = (
    <>
      {!isCompact && (
        <N1Card title={COMMON_STRINGS.account} icon="clipboard">
          <N1KeyValueList
            variant="plain"
            items={[
              { label: D.role, value: <RoleBadge role={user.role} /> },
              {
                label: D.status,
                value: <UserStatusBadge status={user.status} />,
              },
              { label: D.organization, value: organization?.shortName ?? '' },
            ]}
          />
        </N1Card>
      )}
      <ActivityCard items={user.activity} />
      <PermissionsCard
        permissions={user.permissions}
        onChange={setPermission}
        disabled={saving}
      />
    </>
  );

  return (
    <AdminScreen header={header} testID="user-details-screen">
      <SplitLayout aside={aside}>
        {isCompact ? (
          <>
            <N1Card>{hero}</N1Card>
            <N1Card title={D.contact}>
              <N1DetailGrid items={contactItems} columns={1} />
            </N1Card>
          </>
        ) : (
          <N1Card padding="xxl">
            <View style={styles.section}>
              <View style={styles.topRow}>
                <N1Button
                  title={
                    user.status === 'active' ? D.markInactive : D.markActive
                  }
                  leftIcon="info"
                  variant="secondary"
                  size="sm"
                  onPress={toggleActive}
                  testID="toggle-active"
                />
                <N1Text variant="small" color="secondary">
                  {D.joined(formatDate(user.joinedAt))}
                </N1Text>
              </View>
              <N1Divider spacing="sm" />
              {hero}
              <N1Divider spacing="sm" />
              <N1DetailGrid items={contactItems} />
              {user.attachments.length > 0 && (
                <>
                  <N1Divider spacing="sm" />
                  <N1Text variant="title" weight="bold">
                    {D.attachments}
                  </N1Text>
                  <AttachmentList files={user.attachments} />
                </>
              )}
            </View>
          </N1Card>
        )}
      </SplitLayout>

      <UserFormModal
        visible={formOpen}
        user={user}
        organizationName={orgName}
        onClose={closeForm}
      />
      <DeleteUserDialog
        user={deletion.target}
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </AdminScreen>
  );
}
