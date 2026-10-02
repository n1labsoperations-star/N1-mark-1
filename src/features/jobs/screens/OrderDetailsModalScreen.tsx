import { View } from 'react-native';
import {
  AsyncContent,
  ComingSoon,
  N1Header,
  N1Text,
  UserScreen,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import {
  ORDER_STRINGS,
  OrderStatusBadge,
  PriorityBadge,
  orderHeading,
  useOrder,
} from '../../orders';
import { OrderInfo } from '../components/OrderInfo';
import { JOBS_STRINGS } from '../constants';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.orderDetails;

const makeStyles = createN1Styles(t => ({
  summary: { gap: t.spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
}));

/**
 * The work order behind a job, read only, as a full screen modal over the
 * operator's Job Detail or the QC Check.
 */
export function OrderDetailsModalScreen({
  route,
  navigation,
}: JobsScreenProps<'OrderDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { orderId } = route.params;
  const { order, status, error, reload } = useOrder(orderId);

  const header = (
    <N1Header
      title={S.title}
      leftIcon="close"
      onLeftPress={() => navigation.goBack()}
    />
  );

  if (!order) {
    return (
      <UserScreen header={header} testID="order-details-modal">
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon
            icon="package"
            title={S.title}
            message={ORDER_STRINGS.details.notFound}
          />
        </AsyncContent>
      </UserScreen>
    );
  }

  return (
    <UserScreen header={header} testID="order-details-modal">
      <View style={styles.summary}>
        <View style={styles.badges}>
          <PriorityBadge priority={order.priority} suffix="priority" />
          <OrderStatusBadge status={order.status} />
        </View>
        <N1Text variant="h2">{orderHeading(order)}</N1Text>
        {order.customerName !== '' && (
          <N1Text weight="semiBold" color="secondary">
            {order.customerName}
          </N1Text>
        )}
      </View>
      <OrderInfo order={order} />
    </UserScreen>
  );
}
