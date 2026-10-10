import { useCallback, useState, type ReactNode } from 'react';
import {
  AdminScreen,
  AdminScreenBackground,
  AsyncContent,
  DetailHeader,
  N1KeyValueList,
} from '../../../shared/components';
import { formatDate } from '../../../shared/utils';
import { AccountSettingsForm } from '../components/AccountSettingsForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';
import type { ProfileScreenProps } from '../types';

/**
 * Phones: one of My profile's menu rows as its own screen. Organization
 * details lists the organization facts; Account settings and Address details
 * share the account form; Security sets the password.
 */
export function ProfileSectionScreen({
  navigation,
  route,
}: ProfileScreenProps<'ProfileSection'>) {
  const { section } = route.params;
  const { profile, organization, status, error, reload } = useSession();
  const [editing, setEditing] = useState(false);
  const startEdit = useCallback(() => setEditing(true), []);
  const stopEdit = useCallback(() => setEditing(false), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  // Straight on a white page, like the menu that opens it.
  const screen = (children: ReactNode, footer?: ReactNode) => (
    <AdminScreenBackground.Provider value="surface">
      <AdminScreen
        header={<DetailHeader title={S.menu[section]} onBack={goBack} />}
        compactFooter={footer}
        testID={`profile-section-${section}`}
      >
        {children}
      </AdminScreen>
    </AdminScreenBackground.Provider>
  );

  if (section === 'security') {
    return screen(<ChangePasswordForm />);
  }
  if (!profile) {
    return screen(
      <AsyncContent status={status} error={error} onRetry={reload}>
        {null}
      </AsyncContent>,
    );
  }
  if (section === 'organization') {
    // Read-only facts about the person's organization; more rows to come.
    return screen(
      <N1KeyValueList
        variant="plain"
        items={[
          { label: S.organization, value: organization?.name ?? '' },
          { label: S.organizationCode, value: organization?.code ?? '' },
          { label: S.memberSince, value: formatDate(profile.memberSince) },
        ]}
        testID="profile-organization"
      />,
    );
  }
  // Edit (Cancel / Save while editing) sits in a footer above the keyboard.
  return (
    <AccountSettingsForm
      profile={profile}
      part={section === 'address' ? 'address' : 'details'}
      editing={editing}
      onEdit={startEdit}
      onDone={stopEdit}
      layout={({ form, footer }) => screen(form, footer)}
    />
  );
}
