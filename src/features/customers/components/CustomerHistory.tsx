import { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  N1Card,
  N1Table,
  N1Text,
  type N1TableColumn,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import {
  formatCurrency,
  formatDate,
  formatLongDate,
} from '../../../shared/utils';
import {
  QuoteStatusBadge,
  calculateTotals,
  useQuotes,
  type Quote,
} from '../../billing';
import type { AdminDrawerParamList } from '../../dashboard/types';
import {
  OrderStatusBadge,
  orderTitle,
  useOrders,
  type WorkOrder,
} from '../../orders';
import { CUSTOMER_STRINGS } from '../constants';
import type { Customer } from '../types';

const D = CUSTOMER_STRINGS.details;
const C = D.columns;

const newestFirst = (a: string, b: string) => b.localeCompare(a);
/** Empty-table text: say so while the list is still loading. */
const emptyText = (status: string, empty: string) =>
  status === 'succeeded' ? empty : COMMON_STRINGS.loading;
const quoteTotal = (q: Quote) =>
  calculateTotals(q.lineItems, q.quantity, 0, q.gstRate).total;

const ORDER_COLUMNS: N1TableColumn<WorkOrder>[] = [
  {
    key: 'id',
    title: C.order,
    render: o => <N1Text weight="bold">{`WO #${o.id}`}</N1Text>,
  },
  {
    key: 'part',
    title: C.part,
    flex: 2,
    render: o => <N1Text numberOfLines={1}>{orderTitle(o)}</N1Text>,
  },
  {
    key: 'quantity',
    title: C.qty,
    hideOnCompact: true,
    render: o => <N1Text>{o.quantity}</N1Text>,
  },
  {
    key: 'due',
    title: C.due,
    render: o => <N1Text>{formatLongDate(o.dueDate)}</N1Text>,
  },
  {
    key: 'status',
    title: C.status,
    render: o => <OrderStatusBadge status={o.status} />,
  },
];

const QUOTE_COLUMNS: N1TableColumn<Quote>[] = [
  {
    key: 'id',
    title: C.quote,
    render: q => <N1Text weight="bold">{q.id}</N1Text>,
  },
  {
    key: 'part',
    title: C.part,
    flex: 2,
    render: q => <N1Text numberOfLines={1}>{q.partName}</N1Text>,
  },
  {
    key: 'amount',
    title: C.amount,
    render: q => <N1Text>{formatCurrency(quoteTotal(q))}</N1Text>,
  },
  {
    key: 'date',
    title: C.date,
    render: q => <N1Text>{formatDate(q.createdAt)}</N1Text>,
  },
  {
    key: 'status',
    title: C.status,
    render: q => <QuoteStatusBadge status={q.status} />,
  },
];

/**
 * The customer's work orders and the quotes shared with them (drafts are
 * left out), newest first. A row opens it in Orders or Billing.
 */
export const CustomerHistory = memo(function CustomerHistoryComponent({
  customer,
}: {
  customer: Customer;
}) {
  const navigation = useNavigation();
  const drawer =
    navigation.getParent<DrawerNavigationProp<AdminDrawerParamList>>();
  const orders = useOrders();
  const quotes = useQuotes();

  const customerOrders = useMemo(
    () =>
      orders.items
        .filter(o => o.customerId === customer.id)
        .sort((a, b) => newestFirst(a.createdAt, b.createdAt)),
    [orders.items, customer.id],
  );
  const sharedQuotes = useMemo(() => {
    const name = customer.name.trim().toLowerCase();
    return quotes.items
      .filter(
        q =>
          q.status !== 'draft' && q.customerName.trim().toLowerCase() === name,
      )
      .sort((a, b) => newestFirst(a.createdAt, b.createdAt));
  }, [quotes.items, customer.name]);

  const openOrder = useCallback(
    (o: WorkOrder) =>
      drawer?.navigate('Orders', {
        screen: 'OrderDetails',
        params: { orderId: o.id },
        initial: false,
      }),
    [drawer],
  );
  const openQuote = useCallback(
    (q: Quote) =>
      drawer?.navigate('Billing', {
        screen: 'QuoteDetails',
        params: { quoteId: q.id },
        initial: false,
      }),
    [drawer],
  );

  return (
    <>
      <N1Card title={D.orderHistory} icon="package">
        <N1Table
          columns={ORDER_COLUMNS}
          data={customerOrders}
          keyExtractor={o => o.id}
          onRowPress={openOrder}
          emptyText={emptyText(orders.status, D.noOrders)}
          testID="customer-orders"
        />
      </N1Card>
      <N1Card title={D.quoteHistory} icon="receipt">
        <N1Table
          columns={QUOTE_COLUMNS}
          data={sharedQuotes}
          keyExtractor={q => q.id}
          onRowPress={openQuote}
          emptyText={emptyText(quotes.status, D.noQuotes)}
          testID="customer-quotes"
        />
      </N1Card>
    </>
  );
});
