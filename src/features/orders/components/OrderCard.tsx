import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../N1Modules';
import { formatDayMonth } from '../../../shared/utils';
import { ORDER_STRINGS } from '../constants';
import type { WorkOrder } from '../types';
import { orderHeading } from '../utils';
import { OrderStatusBadge, PriorityBadge } from './OrderBadges';

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  title: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
}));

/** One work order on the phone list. */
export const OrderCard = memo(function OrderCardComponent({
  order,
}: {
  order: WorkOrder;
}) {
  const styles = useN1Styles(makeStyles);
  const meta = [
    order.customerName,
    order.dueDate && ORDER_STRINGS.due(formatDayMonth(order.dueDate)),
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={styles.card} testID={`order-card-${order.id}`}>
      <View style={styles.top}>
        <N1Text
          variant="title"
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {orderHeading(order)}
        </N1Text>
        <N1Icon name="chevron-right" size="sm" color="textTertiary" />
      </View>
      {meta !== '' && (
        <N1Text variant="small" color="secondary">
          {meta}
        </N1Text>
      )}
      <View style={styles.badges}>
        <PriorityBadge priority={order.priority} />
        <OrderStatusBadge status={order.status} />
      </View>
    </View>
  );
});
