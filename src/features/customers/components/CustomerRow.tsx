import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Avatar,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../N1Modules';
import { formatCurrency } from '../../../shared/utils';
import { CUSTOMER_STRINGS } from '../constants';
import type { Customer } from '../types';

const makeStyles = createN1Styles(t => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  body: { flex: 1, gap: t.spacing.xs },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  amounts: { flexDirection: 'row', gap: t.spacing.md },
}));

/** One customer on the phone list: name, project counts, billed and outstanding. */
export const CustomerRow = memo(function CustomerRowComponent({
  customer,
}: {
  customer: Customer;
}) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID={`customer-row-${customer.id}`}>
      <N1Avatar name={customer.name} size="sm" />
      <View style={styles.body}>
        <View style={styles.line}>
          <N1Text variant="title" weight="bold" numberOfLines={1}>
            {customer.name}
          </N1Text>
          <N1Icon name="chevron-right" size="sm" color="textTertiary" />
        </View>
        <View style={styles.line}>
          <N1Text variant="caption" color="secondary">
            {CUSTOMER_STRINGS.activeDone(
              customer.currentProjects,
              customer.previousProjects,
            )}
          </N1Text>
          <View style={styles.amounts}>
            <N1Text variant="small" weight="semiBold">
              {formatCurrency(customer.totalRevenue)}
            </N1Text>
            <N1Text variant="small" weight="semiBold">
              {formatCurrency(customer.outstandingBalance)}
            </N1Text>
          </View>
        </View>
      </View>
    </View>
  );
});
