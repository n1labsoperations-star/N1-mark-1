import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Card,
  N1DetailGrid,
  N1Divider,
  N1IconButton,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../N1Modules';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import {
  ActivityCard,
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  SplitLayout,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatLongDate, notifyUnavailable } from '../../../shared/utils';
import { DocumentList } from '../components/DocumentList';
import { DrawingPreview } from '../components/DrawingPreview';
import { OrderStatusBadge, PriorityBadge } from '../components/OrderBadges';
import { QrPlaceholder } from '../components/QrPlaceholder';
import { ORDER_STRINGS } from '../constants';
import { useOrder } from '../hooks/useOrders';
import { orderHeading } from '../utils';

const D = ORDER_STRINGS.details;
const F = ORDER_STRINGS.form;
const orDash = (v: string) => v || COMMON_STRINGS.dash;

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.md,
  },
  titleText: { flex: 1, gap: t.spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  drawingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
}));

export function OrderDetailsScreen({
  route,
  navigation,
}: AdminScreenProps<'OrderDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { order, status, error, reload } = useOrder(route.params.orderId);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const edit = useCallback(
    () => navigation.navigate('OrderForm', { orderId: route.params.orderId }),
    [navigation, route.params.orderId],
  );
  const openCustomer = useCallback(() => {
    if (order?.customerId) {
      navigation.navigate('CustomerDetails', { customerId: order.customerId });
    }
  }, [navigation, order?.customerId]);
  const openRouteCard = useCallback(
    () => navigation.navigate('JobCards'),
    [navigation],
  );
  const printDrawing = useCallback(() => notifyUnavailable(D.printDrawing), []);
  const download = useCallback(() => notifyUnavailable(D.downloadAction), []);

  const additional = useMemo(
    () =>
      order
        ? [
            { label: F.poNumber, value: orDash(order.poNumber) },
            { label: F.routeCardNo, value: orDash(order.routeCardNo) },
            { label: F.dcNo, value: orDash(order.dcNo) },
            { label: F.dcDate, value: orDash(formatLongDate(order.dcDate)) },
            { label: F.partNumber, value: orDash(order.partNumber) },
            { label: F.drawingNumber, value: orDash(order.drawingNumber) },
            { label: F.rmPartNumber, value: orDash(order.rmPartNumber) },
            { label: F.shopOrderNumber, value: orDash(order.shopOrderNumber) },
            { label: F.rawMaterialSize, value: orDash(order.rawMaterialSize) },
            { label: F.heatNumber, value: orDash(order.heatNumber) },
            { label: F.projectId, value: orDash(order.projectId) },
            {
              label: F.rawMaterialGrade,
              value: orDash(order.rawMaterialGrade),
            },
          ]
        : [],
    [order],
  );

  const editIcon = (
    <N1IconButton
      icon="edit"
      size="sm"
      accessibilityLabel={D.edit}
      onPress={edit}
    />
  );
  const header = (
    <DetailHeader
      title={isCompact ? D.compactTitle : D.title}
      onBack={goBack}
      compactRight={order && editIcon}
    />
  );

  if (!order) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="package" title={D.title} message={D.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const mainDetails = [
    {
      label: D.material,
      value: orDash(order.material || order.rawMaterialGrade),
    },
    {
      label: D.quantity,
      value: order.quantity
        ? ORDER_STRINGS.quantity(order.quantity)
        : COMMON_STRINGS.dash,
    },
    { label: D.dueDate, value: orDash(formatLongDate(order.dueDate)) },
  ];

  const summary = (
    <View style={styles.titleRow}>
      <View style={styles.titleText}>
        <View style={styles.badges}>
          <PriorityBadge priority={order.priority} suffix="priority" />
          <OrderStatusBadge status={order.status} />
        </View>
        <N1Text variant={isCompact ? 'h2' : 'h1'}>{orderHeading(order)}</N1Text>
        {order.customerName !== '' && (
          <N1Button
            title={order.customerName}
            variant="ghost"
            size="sm"
            onPress={openCustomer}
          />
        )}
      </View>
      {!isCompact && (
        <N1Button
          title={D.edit}
          leftIcon="edit"
          variant="secondary"
          size="sm"
          onPress={edit}
          testID="edit-order"
        />
      )}
    </View>
  );

  const notes = order.notes !== '' && (
    <View style={styles.section}>
      <N1Text variant="title" weight="bold">
        {D.notes}
      </N1Text>
      <N1Text color="secondary">{order.notes}</N1Text>
    </View>
  );

  const drawingNo = orDash(order.drawingNumber);
  const drawingCard = (
    <N1Card title={D.drawing}>
      <View style={styles.section}>
        <DrawingPreview drawingNumber={drawingNo} />
        <View style={styles.drawingMeta}>
          <View>
            <N1Text variant="caption" color="secondary">
              {D.drawingNo}
            </N1Text>
            <N1Text weight="bold">{drawingNo}</N1Text>
          </View>
          <QrPlaceholder />
        </View>
        <N1Button
          title={D.printDrawing}
          leftIcon="printer"
          variant="secondary"
          fullWidth
          onPress={printDrawing}
        />
      </View>
    </N1Card>
  );

  const aside = (
    <>
      {drawingCard}
      <N1Card title={D.documents}>
        <DocumentList documents={order.documents} onDownload={download} />
      </N1Card>
      <N1Card title={D.routeCard}>
        <View style={styles.section}>
          <N1Text variant="small" color="secondary">
            {D.routeCardHelp}
          </N1Text>
          <N1Button
            title={D.viewRouteCard}
            leftIcon="file"
            fullWidth
            onPress={openRouteCard}
            testID="view-route-card"
          />
        </View>
      </N1Card>
      <ActivityCard
        title={D.statusHistory}
        icon="clock"
        layout="stacked"
        items={order.statusHistory}
      />
      {isCompact && notes}
    </>
  );

  return (
    <AdminScreen header={header} testID="order-details-screen">
      <SplitLayout aside={aside}>
        {isCompact ? (
          <>
            {summary}
            <N1KeyValueList title={D.details} items={mainDetails} />
            <N1DetailGrid title={D.additional} items={additional} />
          </>
        ) : (
          <N1Card padding="xxl">
            <View style={styles.section}>
              {summary}
              <N1Divider spacing="sm" />
              <N1DetailGrid items={mainDetails} />
              <N1Divider spacing="sm" />
              <N1DetailGrid title={D.additional} items={additional} />
              {notes && <N1Divider spacing="sm" />}
              {notes}
            </View>
          </N1Card>
        )}
      </SplitLayout>
    </AdminScreen>
  );
}
