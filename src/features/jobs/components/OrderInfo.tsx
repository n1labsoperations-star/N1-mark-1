import { memo, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1DetailGrid,
  N1KeyValueList,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatLongDate } from '../../../shared/utils';
import { DrawingPreview, ORDER_STRINGS, type WorkOrder } from '../../orders';

const D = ORDER_STRINGS.details;
const F = ORDER_STRINGS.form;
const orDash = (v: string) => v || COMMON_STRINGS.dash;

const makeStyles = createN1Styles(t => ({
  section: { gap: t.spacing.md },
}));

/** Work order Details, Additional details and Drawing (Order, QC Check). */
export const OrderInfo = memo(function OrderInfoComponent({
  order,
}: {
  order: WorkOrder;
}) {
  const styles = useN1Styles(makeStyles);
  const additional = useMemo(
    () => [
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
      { label: F.rawMaterialGrade, value: orDash(order.rawMaterialGrade) },
    ],
    [order],
  );

  return (
    <>
      <N1KeyValueList
        title={D.details}
        items={[
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
        ]}
      />
      <N1DetailGrid title={D.additional} items={additional} />
      <View style={styles.section}>
        <N1Text variant="title" weight="bold">
          {D.drawing}
        </N1Text>
        <DrawingPreview drawingNumber={orDash(order.drawingNumber)} />
      </View>
    </>
  );
});
