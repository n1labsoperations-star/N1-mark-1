import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1IconButton,
  N1PageHeader,
  N1Pagination,
  N1Table,
  N1Text,
  useN1Breakpoint,
  type N1TableColumn,
} from '../../../shared/components';
import type { AdminNavigation } from '../../../app/navigation/admin/types';
import {
  AdminScreen,
  AsyncContent,
  ListToolbar,
  StatGrid,
  ToolbarFilter,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useListFilter, usePagination } from '../../../shared/hooks';
import { formatDayMonth } from '../../../shared/utils';
import { OrderCard } from '../components/OrderCard';
import { OrderStatusBadge, PriorityBadge } from '../components/OrderBadges';
import {
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_STRINGS as S,
  PRIORITY_FILTER_OPTIONS,
} from '../constants';
import { useOrderStats, useOrders } from '../hooks/useOrders';
import type { WorkOrder } from '../types';
import {
  INITIAL_ORDER_FILTERS,
  materialLine,
  matchesOrderFilters,
  orderSearchText,
  orderTitle,
} from '../utils';

const COLUMNS: N1TableColumn<WorkOrder>[] = [
  {
    key: 'order',
    title: S.columns.order,
    flex: 1.6,
    render: o => (
      <View>
        <N1Text weight="bold">{S.workOrder(o.id)}</N1Text>
        <N1Text variant="small" color="secondary" numberOfLines={1}>
          {orderTitle(o) || COMMON_STRINGS.dash}
        </N1Text>
      </View>
    ),
  },
  { key: 'customerName', title: S.columns.customer, flex: 1.5 },
  {
    key: 'material',
    title: S.columns.material,
    flex: 1.6,
    render: o => <N1Text>{materialLine(o) || COMMON_STRINGS.dash}</N1Text>,
  },
  {
    key: 'priority',
    title: S.columns.priority,
    render: o => <PriorityBadge priority={o.priority} />,
  },
  {
    key: 'status',
    title: S.columns.status,
    render: o => <OrderStatusBadge status={o.status} />,
  },
  {
    key: 'dueDate',
    title: S.columns.due,
    flex: 0.8,
    render: o => (
      <N1Text>{formatDayMonth(o.dueDate) || COMMON_STRINGS.dash}</N1Text>
    ),
  },
];

const renderCompactItem = (o: WorkOrder) => <OrderCard order={o} />;

export function OrdersListScreen() {
  const navigation = useNavigation<AdminNavigation>();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useOrders();
  const stats = useOrderStats();

  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: orderSearchText,
      initialFilters: INITIAL_ORDER_FILTERS,
      matchesFilters: matchesOrderFilters,
    },
  );
  const pager = usePagination(filtered);

  const openCreate = useCallback(
    () => navigation.navigate('OrderForm'),
    [navigation],
  );
  const openDetails = useCallback(
    (o: WorkOrder) => navigation.navigate('OrderDetails', { orderId: o.id }),
    [navigation],
  );

  const statItems = useMemo(
    () => [
      { key: 'open', label: S.stats.open, value: stats.open },
      { key: 'high', label: S.stats.high, value: stats.highPriority },
    ],
    [stats],
  );

  const createButton = isCompact ? (
    <N1IconButton
      icon="plus"
      variant="primary"
      accessibilityLabel={S.createA11y}
      onPress={openCreate}
      testID="create-order"
    />
  ) : (
    <N1Button
      title={S.create}
      leftIcon="plus"
      onPress={openCreate}
      testID="create-order"
    />
  );

  return (
    <AdminScreen testID="orders-screen">
      <N1PageHeader
        title={S.title}
        subtitle={isCompact ? undefined : S.subtitle}
        right={createButton}
      />
      {isCompact && <StatGrid items={statItems} variant="muted" />}
      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={S.search}
      >
        <ToolbarFilter
          label={S.priorityFilter}
          options={PRIORITY_FILTER_OPTIONS}
          value={filters.priority}
          onChange={v => setFilter('priority', v)}
          testID="filter-priority"
        />
        <ToolbarFilter
          label={S.statusFilter}
          options={ORDER_STATUS_FILTER_OPTIONS}
          value={filters.status}
          onChange={v => setFilter('status', v)}
          testID="filter-order-status"
        />
      </ListToolbar>
      <AsyncContent
        status={status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        <N1Table
          columns={COLUMNS}
          data={pager.pageItems}
          keyExtractor={o => o.id}
          onRowPress={openDetails}
          renderCompactItem={renderCompactItem}
          emptyText={
            items.length ? COMMON_STRINGS.noResults : COMMON_STRINGS.empty
          }
          footer={
            (!isCompact || pager.pageCount > 1) && (
              <N1Pagination
                summary={COMMON_STRINGS.showing(
                  pager.shownCount,
                  pager.total,
                  S.noun,
                )}
                hasPrevious={pager.hasPrevious}
                hasNext={pager.hasNext}
                onPrevious={pager.previous}
                onNext={pager.next}
              />
            )
          }
          testID="orders-table"
        />
      </AsyncContent>
    </AdminScreen>
  );
}
