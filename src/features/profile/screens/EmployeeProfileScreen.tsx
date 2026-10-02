import { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  AsyncContent,
  N1Avatar,
  N1Button,
  N1ConfirmDialog,
  N1Header,
  N1IconButton,
  N1KeyValueList,
  N1Text,
  UserScreen,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { useToggle } from '../../../shared/hooks';
import { useAuthSession } from '../../auth/hooks';
import { formatLongDate } from '../../../shared/utils';
import {
  EMPLOYEE_PROFILE_STRINGS as S,
  EMPLOYEE_ROLE_LABELS,
} from '../constants';
import { useEmployeeProfile } from '../hooks/useEmployeeProfile';
import type { EmployeeProfileParamList } from '../types';

export const makeEmployeeScreenStyles = createN1Styles(t => ({
  identity: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg },
  names: { flex: 1, gap: t.spacing.xxs },
  // N1Button pins itself to the top by default.
  centered: { alignSelf: 'center' },
}));

/** Profile tab, shared by every non-admin role. */
export function EmployeeProfileScreen() {
  const styles = useN1Styles(makeEmployeeScreenStyles);
  const navigation = useNavigation<NavigationProp<EmployeeProfileParamList>>();
  const { profile, status, error, reload, logout } = useEmployeeProfile();
  const [logoutOpen, openLogout, closeLogout] = useToggle(false);
  const { signOut } = useAuthSession();

  const openEdit = useCallback(
    () => navigation.navigate('EditProfile'),
    [navigation],
  );
  const confirmLogout = useCallback(() => {
    closeLogout();
    logout();
    // The root navigator swaps this area for the login screens, so Back
    // can't return here.
    signOut();
  }, [closeLogout, logout, signOut]);

  return (
    <UserScreen
      testID="employee-profile-screen"
      header={
        <N1Header
          title={S.title}
          right={
            profile && (
              <N1IconButton
                icon="edit"
                variant="primary"
                size="sm"
                accessibilityLabel={S.editProfile}
                onPress={openEdit}
              />
            )
          }
        />
      }
    >
      {profile ? (
        <>
          <View style={styles.identity}>
            <N1Avatar name={profile.name} size="lg" />
            <View style={styles.names}>
              <N1Text variant="title" weight="bold">
                {profile.name}
              </N1Text>
              <N1Text color="secondary">
                {EMPLOYEE_ROLE_LABELS[profile.role]}
              </N1Text>
            </View>
          </View>
          <N1KeyValueList
            dividers
            items={[
              { label: S.employeeId, value: profile.employeeId },
              { label: S.department, value: profile.department },
              { label: S.shift, value: profile.shift },
              { label: S.joined, value: formatLongDate(profile.joinedOn) },
            ]}
          />
          <N1KeyValueList
            dividers
            items={[
              { label: S.phone, value: profile.phone },
              { label: S.email, value: profile.email },
            ]}
          />
          <N1Button
            title={S.logout}
            leftIcon="logout"
            variant="dangerOutline"
            size="lg"
            fullWidth
            onPress={openLogout}
            testID="employee-logout"
          />
        </>
      ) : (
        <AsyncContent status={status} error={error} onRetry={reload}>
          {null}
        </AsyncContent>
      )}
      <N1ConfirmDialog
        visible={logoutOpen}
        title={S.logoutTitle}
        message={S.logoutMessage}
        confirmLabel={S.logout}
        icon="logout"
        onConfirm={confirmLogout}
        onCancel={closeLogout}
        testID="employee-logout-dialog"
      />
    </UserScreen>
  );
}
