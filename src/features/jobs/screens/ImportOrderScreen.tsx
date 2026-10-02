import { useCallback } from 'react';
import { View } from 'react-native';
import {
  AsyncContent,
  ComingSoon,
  N1Button,
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
import { useMyJobs } from '../hooks/useMyJobs';
import type { JobsScreenProps } from '../types';

const S = JOBS_STRINGS.order;
const D = ORDER_STRINGS.details;

const makeStyles = createN1Styles(t => ({
  summary: { gap: t.spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
}));

/** The scanned work order; Create Job Card asks for its raw material. */
export function ImportOrderScreen({
  route,
  navigation,
}: JobsScreenProps<'ImportOrder'>) {
  const styles = useN1Styles(makeStyles);
  const { orderId } = route.params;
  const { order, status, error, reload } = useOrder(orderId);
  const myJobs = useMyJobs();

  // Already on My Jobs: open its job card instead of importing it again.
  const imported = myJobs.ids.includes(orderId);
  const onPrimary = useCallback(() => {
    if (imported) {
      navigation.navigate('JobCardDetails', { jobCardId: orderId });
    } else {
      navigation.navigate('RawMaterial', { orderId });
    }
  }, [imported, navigation, orderId]);

  const header = (
    <N1Header
      title={S.title}
      leftIcon="chevron-left"
      onLeftPress={() => navigation.goBack()}
    />
  );

  if (!order) {
    return (
      <UserScreen header={header} testID="import-order-screen">
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="package" title={S.title} message={D.notFound} />
        </AsyncContent>
      </UserScreen>
    );
  }

  const footer = (
    <N1Button
      title={imported ? S.viewJobCard : S.createJobCard}
      leftIcon={imported ? 'file' : 'plus'}
      size="lg"
      fullWidth
      disabled={myJobs.status !== 'succeeded'}
      onPress={onPrimary}
      testID="create-job-card"
    />
  );

  return (
    <UserScreen header={header} footer={footer} testID="import-order-screen">
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
