import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Card,
  N1Switch,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { PERMISSION_LABELS, USER_STRINGS } from '../constants';
import type { UserPermissionKey, UserPermissions } from '../types';

type Props = {
  permissions: UserPermissions;
  onChange: (key: UserPermissionKey, value: boolean) => void;
  disabled?: boolean;
};

const KEYS = Object.keys(PERMISSION_LABELS) as UserPermissionKey[];

const makeStyles = createN1Styles(t => ({ list: { gap: t.spacing.md } }));

export const PermissionsCard = memo(function PermissionsCardComponent({
  permissions,
  onChange,
  disabled,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <N1Card title={USER_STRINGS.details.permissions} icon="check-circle">
      <View style={styles.list}>
        {KEYS.map(key => (
          <N1Switch
            key={key}
            label={PERMISSION_LABELS[key]}
            value={permissions[key]}
            onValueChange={value => onChange(key, value)}
            disabled={disabled}
            testID={`permission-${key}`}
          />
        ))}
      </View>
    </N1Card>
  );
});
