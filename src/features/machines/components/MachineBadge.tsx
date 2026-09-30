import { memo } from 'react';
import { N1Badge } from '../../../shared/components';
import { MACHINE_STATUS_META } from '../constants';
import type { MachineStatus } from '../types';

export const MachineStatusBadge = memo(function MachineStatusBadgeComponent({
  status,
}: {
  status: MachineStatus;
}) {
  const meta = MACHINE_STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} />;
});
