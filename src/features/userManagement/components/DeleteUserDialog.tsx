import { N1ConfirmDialog, N1Text } from '../../../N1Modules';
import { USER_STRINGS } from '../constants';
import type { AdminUser } from '../types';

type Props = {
  user: AdminUser | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteUserDialog({
  user,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const [before, name, after] = USER_STRINGS.delete.message(user?.name ?? '');
  return (
    <N1ConfirmDialog
      visible={user !== null}
      title={USER_STRINGS.delete.title}
      message={
        <>
          {before}
          <N1Text weight="bold">{name}</N1Text>
          {after}
        </>
      }
      confirmLabel={USER_STRINGS.delete.confirm}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
      testID="delete-user-dialog"
    />
  );
}
