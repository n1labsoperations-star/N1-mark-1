import { memo } from 'react';
import { N1Avatar, N1Badge } from '../../../shared/components';
import { ORDER_STATUS_META, PRIORITY_META } from '../constants';
import type { OrderPriority, OrderStatus } from '../types';

export const PriorityBadge = memo(function PriorityBadgeComponent({
  priority,
  suffix,
}: {
  priority: OrderPriority;
  /** e.g. "priority" → "High priority". */
  suffix?: string;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <N1Badge
      label={suffix ? `${meta.label} ${suffix}` : meta.label}
      tone={meta.tone}
    />
  );
});

export const OrderStatusBadge = memo(function OrderStatusBadgeComponent({
  status,
}: {
  status: OrderStatus;
}) {
  const meta = ORDER_STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} dot />;
});

/** "HI" / "MD" / "LO" tile used in the dashboard's priority jobs. */
export const PriorityMarker = memo(function PriorityMarkerComponent({
  priority,
}: {
  priority: OrderPriority;
}) {
  const meta = PRIORITY_META[priority];
  return (
    <N1Avatar
      label={meta.short}
      name={meta.label}
      shape="rounded"
      size="sm"
      tone={meta.tone}
    />
  );
});
