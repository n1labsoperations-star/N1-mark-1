import { useCallback } from 'react';
import { PasswordSetForm } from '../../../shared/components';
import { PROFILE_STRINGS as S } from '../constants';
import { useSession } from '../hooks/useSession';

/** My profile → Security: set a new password for the signed-in person. */
export function ChangePasswordForm() {
  const { profile, changePassword, changingPassword, passwordError } =
    useSession();
  const save = useCallback(
    (newPassword: string) => changePassword({ newPassword }),
    [changePassword],
  );
  return (
    <PasswordSetForm
      title={S.passwordTitle}
      subtitle={S.passwordSubtitle}
      hasPassword={profile?.hasPassword ?? false}
      saving={changingPassword}
      error={passwordError}
      onSave={save}
    />
  );
}
