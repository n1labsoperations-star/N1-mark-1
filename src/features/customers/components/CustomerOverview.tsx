import { memo, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1StatCard,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { DonutChart } from '../../../shared/components';
import { CUSTOMER_STRINGS } from '../constants';
import { useCustomerShares } from '../hooks/useCustomers';

const makeStyles = createN1Styles(t => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  stat: { minWidth: 0, backgroundColor: t.colors.surfaceMuted },
}));

/** Phone summary above the customer list: donut + two counts. */
export const CustomerOverview = memo(function CustomerOverviewComponent({
  customerCount,
}: {
  customerCount: number;
}) {
  const styles = useN1Styles(makeStyles);
  const { shares, totalOrders } = useCustomerShares();
  const segments = useMemo(
    () =>
      shares.map(s => ({
        key: s.id,
        value: s.orders,
        color: s.color,
        label: s.name,
      })),
    [shares],
  );
  return (
    <View style={styles.row} testID="customer-overview">
      <DonutChart
        segments={segments}
        size="sm"
        centerValue={totalOrders}
        centerCaption={CUSTOMER_STRINGS.stats.orders}
      />
      <N1StatCard
        label={CUSTOMER_STRINGS.stats.customers}
        value={customerCount}
        style={styles.stat}
      />
      <N1StatCard
        label={CUSTOMER_STRINGS.stats.activeOrders}
        value={totalOrders}
        style={styles.stat}
      />
    </View>
  );
});
