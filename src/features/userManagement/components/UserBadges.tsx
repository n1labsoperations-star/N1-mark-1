import { memo } from 'react';
import { N1Badge } from '../../../shared/components';
import { ROLE_META, STATUS_META } from '../constants';
import type { UserRole, UserStatus } from '../types';

export const RoleBadge = memo(function RoleBadgeComponent({
  role,
}: {
  role: UserRole;
}) {
  const meta = ROLE_META[role];
  return <N1Badge label={meta.label} tone={meta.tone} />;
});

export const UserStatusBadge = memo(function UserStatusBadgeComponent({
  status,
}: {
  status: UserStatus;
}) {
  const meta = STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} dot />;
});
