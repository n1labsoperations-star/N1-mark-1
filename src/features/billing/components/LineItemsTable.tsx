import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Table,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1TableColumn,
} from '../../../N1Modules';
import { formatCurrency } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { LineItem } from '../types';
import { lineAmount, rateLabel, timeQtyLabel } from '../utils';

const L = BILLING_STRINGS.lineItems;

const makeStyles = createN1Styles(t => ({
  table: { borderWidth: t.borderWidth.hairline, borderColor: t.colors.border },
  card: {
    gap: t.spacing.xxs,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.background,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
}));

type Props = { items: readonly LineItem[]; quantity: number };

/** Read-only process operations (invoice and quote detail). */
export const LineItemsTable = memo(function LineItemsTableComponent({
  items,
  quantity,
}: Props) {
  const styles = useN1Styles(makeStyles);

  const columns = useMemo<N1TableColumn<LineItem>[]>(
    () => [
      {
        key: 'operation',
        title: L.operation,
        render: i => <N1Text weight="bold">{i.operation}</N1Text>,
      },
      { key: 'description', title: L.description, flex: 2.4 },
      {
        key: 'timeQty',
        title: L.timeQty,
        flex: 1.2,
        render: i => <N1Text>{timeQtyLabel(i, quantity)}</N1Text>,
      },
      {
        key: 'rate',
        title: L.rate,
        render: i => <N1Text>{rateLabel(i)}</N1Text>,
      },
      {
        key: 'amount',
        title: L.amount,
        render: i => (
          <N1Text weight="bold">
            {formatCurrency(lineAmount(i, quantity))}
          </N1Text>
        ),
      },
    ],
    [quantity],
  );

  const renderCompactItem = useCallback(
    (i: LineItem) => (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <N1Text weight="bold">{i.operation}</N1Text>
          <N1Text weight="bold">
            {formatCurrency(lineAmount(i, quantity))}
          </N1Text>
        </View>
        <N1Text variant="small">{i.description}</N1Text>
        <N1Text variant="caption" color="secondary">
          {`${timeQtyLabel(i, quantity)} · ${rateLabel(i)}`}
        </N1Text>
      </View>
    ),
    [styles, quantity],
  );

  return (
    <N1Table
      columns={columns}
      data={items as LineItem[]}
      keyExtractor={i => i.id}
      renderCompactItem={renderCompactItem}
      emptyText={L.none}
      style={styles.table}
      testID="line-items-table"
    />
  );
});
