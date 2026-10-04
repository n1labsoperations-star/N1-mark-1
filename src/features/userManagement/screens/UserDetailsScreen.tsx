import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  N1Avatar,
  N1Card,
  N1Divider,
  N1Icon,
  N1Tabs,
  type N1Tab,
  N1Text,
  PasswordSetForm,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { SECTION_NAV_WIDTH } from '../../../shared/constants';
import { useConfirmDelete } from '../../../shared/hooks';
import { formatDate } from '../../../shared/utils';
import { useSession } from '../../profile';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { UserAddressForm } from '../components/UserAddressForm';
import { UserDocuments } from '../components/UserDocuments';
import { UserWorkHistory } from '../components/UserWorkHistory';
import { RoleBadge, UserStatusBadge } from '../components/UserBadges';
import { UserDetailsForm } from '../components/UserDetailsForm';
import { USER_STRINGS } from '../constants';
import { useUser } from '../hooks/useUsers';
import type { AdminUser, UserManagementScreenProps } from '../types';

const D = USER_STRINGS.details;

type Section = 'profile' | 'address' | 'work' | 'security' | 'documents';

const SECTIONS: N1Tab<Section>[] = [
  { key: 'profile', label: D.sections.profile, icon: 'user' },
  { key: 'address', label: D.sections.address, icon: 'building' },
  { key: 'work', label: D.sections.work, icon: 'clipboard' },
  { key: 'security', label: D.sections.security, icon: 'lock' },
  { key: 'documents', label: D.sections.documents, icon: 'file' },
];

const makeStyles = createN1Styles(t => ({
  // Wide screens: the card fills the window; only the section scrolls.
  card: { flex: 1, minHeight: 0 },
  row: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: t.spacing.xl,
  },
  nav: {
    width: SECTION_NAV_WIDTH,
    paddingRight: t.spacing.xl,
    borderRightWidth: t.borderWidth.hairline,
    borderRightColor: t.colors.border,
    gap: t.spacing.lg,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    height: t.controlHeight.md,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.sm,
  },
  pressed: { opacity: t.opacity.pressed },
  // A small link at the top of the card.
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.spacing.xs,
    marginBottom: t.spacing.lg,
  },
  content: { flex: 1 },
  section: { gap: t.spacing.lg },
  compactTabs: { marginBottom: t.spacing.lg },
  identity: { gap: t.spacing.sm },
  compactIdentity: { marginBottom: t.spacing.lg },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
  },
  identityText: { flex: 1, gap: t.spacing.xxs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
}));

/**
 * An admin's view of someone in Users, laid out like Organization details:
 * who they are at the top of the section menu, then Profile, Address
 * details, Work history, Security and Documents, edited in place. Your own page is My profile.
 */
export function UserDetailsScreen({
  route,
  navigation,
}: UserManagementScreenProps<'UserDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { organization } = useSession();
  const {
    user,
    status,
    error,
    reload,
    update,
    remove,
    saving,
    saveError,
    deletingId,
    deleteError,
  } = useUser(route.params.userId);
  const [section, setSection] = useState<Section>('profile');
  const [editing, setEditing] = useState(false);
  // Always the Users list, wherever this page was opened from.
  const goBack = useCallback(() => navigation.popTo('UsersList'), [navigation]);
  const deletion = useConfirmDelete<AdminUser>(
    remove,
    deletingId,
    deleteError,
    goBack,
  );
  const orgName = organization?.name ?? '';

  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  // Leaving a section drops its unsaved edits.
  const changeSection = useCallback((key: Section) => {
    setSection(key);
    setEditing(false);
  }, []);

  // Opens in Job Cards; Back there returns here.
  const openJobCard = useCallback(
    (jobCardId: string) =>
      navigation.navigate('JobCards', {
        screen: 'JobCardDetails',
        params: { jobCardId },
        initial: false,
      }),
    [navigation],
  );

  const resetPassword = useCallback(
    (password: string) => {
      if (user) {
        update(user.id, { password });
      }
    },
    [user, update],
  );

  const deleteLink = user && (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={USER_STRINGS.a11y.delete(user.name)}
      onPress={() => deletion.request(user)}
      style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}
      testID="delete-user"
    >
      <N1Icon name="trash" size="sm" color="danger" />
      <N1Text variant="label" weight="semiBold" color="danger">
        {D.deleteUser}
      </N1Text>
    </Pressable>
  );

  const backLink = (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={D.backToUsers}
      onPress={goBack}
      style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
      testID="user-details-back"
    >
      <N1Icon name="arrow-left" size="sm" color="textSecondary" />
      <N1Text variant="label" color="secondary">
        {D.backToUsers}
      </N1Text>
    </Pressable>
  );

  // Compact identity at the top of the section menu (above the tabs on phones).
  const identity = user && (
    <View style={styles.identity} testID="user-identity">
      <View style={styles.identityRow}>
        <N1Avatar name={user.name} size="md" />
        <View style={styles.identityText}>
          <N1Text variant="title" weight="bold" numberOfLines={1}>
            {user.name}
          </N1Text>
          <N1Text variant="caption" color="secondary" numberOfLines={2}>
            {[user.designation, orgName].filter(Boolean).join(' · ')}
          </N1Text>
        </View>
      </View>
      <View style={styles.badges}>
        <RoleBadge role={user.role} />
        <UserStatusBadge status={user.status} />
      </View>
      <N1Text variant="caption" color="tertiary">
        {D.joined(formatDate(user.joinedAt))}
      </N1Text>
    </View>
  );

  const content = () => {
    if (!user) {
      return (
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="user" title={D.title} message={D.notFound} />
        </AsyncContent>
      );
    }
    switch (section) {
      case 'profile':
        return (
          <View style={styles.section}>
            <UserDetailsForm
              user={user}
              organizationName={orgName}
              editing={editing}
              onEdit={startEdit}
              onDone={stopEdit}
            />
            {isCompact && deleteLink}
          </View>
        );
      case 'address':
        return (
          <UserAddressForm
            user={user}
            editing={editing}
            onEdit={startEdit}
            onDone={stopEdit}
          />
        );
      case 'work':
        return <UserWorkHistory user={user} onOpen={openJobCard} />;
      case 'security':
        return (
          <PasswordSetForm
            title={D.resetPassword}
            subtitle={D.resetPasswordHelp(user.name)}
            // Invited people haven't set one yet.
            hasPassword={user.status !== 'invited'}
            startLabel={D.resetPassword}
            saving={saving}
            error={saveError}
            onSave={resetPassword}
            testID="user-password"
          />
        );
      case 'documents':
        return <UserDocuments user={user} />;
    }
  };

  const tabs = (
    <N1Tabs
      tabs={SECTIONS}
      value={section}
      onChange={changeSection}
      variant={isCompact ? 'segmented' : 'menu'}
      scrollable={isCompact}
      style={isCompact && styles.compactTabs}
      testID="user-section"
    />
  );

  return (
    <AdminScreen
      header={<DetailHeader title={D.title} onBack={goBack} />}
      fixed
      testID="user-details-screen"
    >
      <N1Card radius="sm" style={!isCompact && styles.card}>
        {backLink}
        {isCompact ? (
          <>
            {identity && <View style={styles.compactIdentity}>{identity}</View>}
            {tabs}
            {content()}
          </>
        ) : (
          <View style={styles.row}>
            <View style={styles.nav}>
              {identity && (
                <>
                  {identity}
                  <N1Divider />
                </>
              )}
              {tabs}
              {deleteLink && (
                <>
                  <N1Divider />
                  {deleteLink}
                </>
              )}
            </View>
            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {content()}
            </ScrollView>
          </View>
        )}
      </N1Card>

      <DeleteUserDialog
        user={deletion.target}
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
    </AdminScreen>
  );
}
