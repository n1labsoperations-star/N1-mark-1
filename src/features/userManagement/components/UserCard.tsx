import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Avatar,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { RowActions } from '../../../shared/components';
import { USER_STRINGS } from '../constants';
import type { AdminUser } from '../types';
import { RoleBadge, UserStatusBadge } from './UserBadges';

type Props = {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
};

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  text: { flex: 1, gap: t.spacing.xxs },
  footer: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  spacer: { flex: 1 },
}));

/** One user on the phone list. */
export const UserCard = memo(function UserCardComponent({
  user,
  onEdit,
  onDelete,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID={`user-card-${user.id}`}>
      <View style={styles.identity}>
        <N1Avatar name={user.name} />
        <View style={styles.text}>
          <N1Text variant="title" weight="bold" numberOfLines={1}>
            {user.name}
          </N1Text>
          <N1Text variant="small" color="secondary" numberOfLines={1}>
            {user.email}
          </N1Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RoleBadge role={user.role} />
        <UserStatusBadge status={user.status} />
        <View style={styles.spacer} />
        <RowActions
          onEdit={() => onEdit(user)}
          onDelete={() => onDelete(user)}
          editLabel={USER_STRINGS.a11y.edit(user.name)}
          deleteLabel={USER_STRINGS.a11y.delete(user.name)}
        />
      </View>
    </View>
  );
});
