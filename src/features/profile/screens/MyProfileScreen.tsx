import { useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  KeyboardScrollView,
  AdminScreen,
  AdminScreenBackground,
  AsyncContent,
  DetailHeader,
  N1Card,
  N1Divider,
  N1Tabs,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { ASIDE_WIDTH } from '../../../shared/constants';
import { AccountSettingsForm } from '../components/AccountSettingsForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { ProfileMenu } from '../components/ProfileMenu';
import { ProfileSummary } from '../components/ProfileSummary';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';
import type { ProfileScreenProps, ProfileSection } from '../types';

type ProfileTab = 'account' | 'security';

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'account', label: S.tabs.account },
  { key: 'security', label: S.tabs.security },
];

const makeStyles = createN1Styles(t => ({
  // One card: summary | line | tabs. Phones stack them with a line between.
  // Wide screens: the card fills the window; the tab content scrolls.
  card: { flex: 1, minHeight: 0 },
  row: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: t.spacing.xl,
  },
  aside: {
    width: ASIDE_WIDTH,
    paddingRight: t.spacing.xl,
    borderRightWidth: t.borderWidth.hairline,
    borderRightColor: t.colors.border,
  },
  main: { flex: 1 },
  tabs: { marginBottom: t.spacing.xl },
  content: { flex: 1 },
}));

/**
 * The signed-in person's own page: a summary (photo, role, organization) and
 * tabs for Account settings and Security. Phones show a menu instead, each
 * row opening its own screen. Other people are managed from Users → User
 * details.
 */
export function MyProfileScreen({
  navigation,
}: ProfileScreenProps<'MyProfile'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { profile, organization, status, error, reload } = useSession();
  const [tab, setTab] = useState<ProfileTab>('account');
  const [editing, setEditing] = useState(false);

  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  // Leaving Account settings drops its unsaved edits.
  const changeTab = useCallback((key: ProfileTab) => {
    setTab(key);
    setEditing(false);
  }, []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  // Phones: each menu row opens its own screen.
  const openMenuItem = useCallback(
    (section: ProfileSection) =>
      navigation.navigate('ProfileSection', { section }),
    [navigation],
  );

  const loading = (
    <AsyncContent status={status} error={error} onRetry={reload}>
      {null}
    </AsyncContent>
  );

  const content = () => {
    if (!profile) {
      return loading;
    }
    switch (tab) {
      case 'account':
        return (
          <AccountSettingsForm
            profile={profile}
            editing={editing}
            onEdit={startEdit}
            onDone={stopEdit}
          />
        );
      case 'security':
        return <ChangePasswordForm />;
    }
  };

  const summary = profile ? (
    <ProfileSummary profile={profile} organization={organization} />
  ) : (
    loading
  );

  const main = (
    <View style={!isCompact && styles.main} testID={`profile-${tab}`}>
      <N1Tabs
        tabs={TABS}
        value={tab}
        onChange={changeTab}
        variant="underline"
        scrollable={isCompact}
        style={styles.tabs}
        testID="profile-tab"
      />
      {isCompact ? (
        content()
      ) : (
        <KeyboardScrollView style={styles.content}>
          {content()}
        </KeyboardScrollView>
      )}
    </View>
  );

  // Phones: the menu straight on a white page, no card.
  if (isCompact) {
    return (
      <AdminScreenBackground.Provider value="surface">
        {/* The top bar shows this screen's name; no header of its own. */}
        <AdminScreen testID="profile-screen">
          {profile ? (
            <ProfileMenu profile={profile} onOpen={openMenuItem} />
          ) : (
            loading
          )}
        </AdminScreen>
      </AdminScreenBackground.Provider>
    );
  }

  return (
    <AdminScreen
      header={<DetailHeader title={S.title} onBack={goBack} />}
      fixed
      testID="profile-screen"
    >
      <N1Card radius="sm" style={!isCompact && styles.card}>
        {isCompact ? (
          <>
            {summary}
            <N1Divider spacing="xl" />
            {main}
          </>
        ) : (
          <View style={styles.row}>
            <View style={styles.aside}>{summary}</View>
            {main}
          </View>
        )}
      </N1Card>
    </AdminScreen>
  );
}
