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
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import type { OrdersScreenProps } from '../types';
import {
  AdminScreen,
  AsyncContent,
  FilterMenu,
  ListToolbar,
  StatGrid,
  type FilterValues,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useListFilter, usePagination } from '../../../shared/hooks';
import { useJobCards } from '../../jobCards';
import { formatDayMonth } from '../../../shared/utils';
import { OrderCard } from '../components/OrderCard';
import { OrderStatusBadge, PriorityBadge } from '../components/OrderBadges';
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STRINGS as S,
  PRIORITY_OPTIONS,
} from '../constants';
import { useOrderStats, useOrders } from '../hooks/useOrders';
import type { OrderFilters, WorkOrder } from '../types';
import {
  INITIAL_ORDER_FILTERS,
  matchesOrderFilters,
  orderSearchText,
  orderTitle,
} from '../utils';

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  // Matches the filled filter next to it in the toolbar.
}));

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
  {
    key: 'customerName',
    title: S.columns.customer,
    flex: 1.5,
    render: o => (
      <N1Text numberOfLines={2}>{o.customerName || COMMON_STRINGS.dash}</N1Text>
    ),
  },
  {
    key: 'poNumber',
    title: S.columns.poNumber,
    render: o => (
      <N1Text numberOfLines={1}>{o.poNumber || COMMON_STRINGS.dash}</N1Text>
    ),
  },
  {
    key: 'routeCardNo',
    title: S.columns.rcNumber,
    render: o => (
      <N1Text numberOfLines={1}>{o.routeCardNo || COMMON_STRINGS.dash}</N1Text>
    ),
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

/** Below this the columns get cramped, so the table scrolls sideways. */
const TABLE_MIN_WIDTH = 1100;

const renderCompactItem = (o: WorkOrder) => <OrderCard order={o} />;

type Navigation = OrdersScreenProps<'OrdersList'>['navigation'];

export function OrdersListScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<Navigation>();
  const jobCards = useJobCards();
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

  const filterGroups = useMemo(
    () => [
      {
        key: 'priority',
        label: S.priorityFilter,
        options: PRIORITY_OPTIONS,
      },
      { key: 'status', label: S.statusFilter, options: ORDER_STATUS_OPTIONS },
    ],
    [],
  );
  const applyFilters = useCallback(
    (next: FilterValues) => {
      setFilter('priority', (next.priority ?? []) as OrderFilters['priority']);
      setFilter('status', (next.status ?? []) as OrderFilters['status']);
    },
    [setFilter],
  );

  const openCreate = useCallback(
    () => navigation.navigate('OrderForm'),
    [navigation],
  );
  const openDetails = useCallback(
    (o: WorkOrder) => navigation.navigate('OrderDetails', { orderId: o.id }),
    [navigation],
  );

  const openEdit = useCallback(
    (o: WorkOrder) => navigation.navigate('OrderForm', { orderId: o.id }),
    [navigation],
  );

  // Opens the order's job card in Job Cards (Back goes to its list), with
  // Create flow open when it has no route yet. Orders without a job card get
  // theirs from Create order (raw material arrived) or the shop floor.
  const openJobCard = useCallback(
    (orderId: string, createFlow: boolean) =>
      navigation.navigate('JobCards', {
        screen: 'JobCardDetails',
        params: { jobCardId: orderId, editFlow: createFlow || undefined },
        initial: false,
      }),
    [navigation],
  );
  const jobCardFor = useCallback(
    (o: WorkOrder) => jobCards.items.find(c => c.id === o.id),
    [jobCards.items],
  );

  const columns = useMemo<N1TableColumn<WorkOrder>[]>(
    () => [
      ...COLUMNS,
      {
        key: 'actions',
        title: S.columns.actions,
        flex: 0.8,
        align: 'right',
        interactive: true,
        render: o => {
          const card = jobCardFor(o);
          return (
            <View style={styles.actions}>
              {/* Only orders that have a job card show the clipboard. */}
              {card && (
                <N1IconButton
                  icon="clipboard"
                  size="sm"
                  accessibilityLabel={
                    card.operations.length
                      ? S.a11y.openJobCard(o.id)
                      : S.a11y.createJobCard(o.id)
                  }
                  onPress={() => openJobCard(o.id, !card.operations.length)}
                  testID={`job-card-${o.id}`}
                />
              )}
              <N1IconButton
                icon="edit"
                variant="primary"
                size="sm"
                accessibilityLabel={S.a11y.edit(o.id)}
                onPress={() => openEdit(o)}
                testID={`edit-order-${o.id}`}
              />
            </View>
          );
        },
      },
    ],
    [styles, jobCardFor, openJobCard, openEdit],
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
      size="sm"
      testID="create-order"
    />
  );

  const firstLoad =
    (status === 'idle' || status === 'loading') && items.length === 0;

  const toolbar = (
    <ListToolbar
      align="end"
      filled
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={S.search}
    >
      <FilterMenu
        groups={filterGroups}
        value={filters}
        onApply={applyFilters}
        testID="orders-filter"
      />
      {!isCompact && createButton}
    </ListToolbar>
  );

  return (
    <AdminScreen testID="orders-screen" fixed>
      {/* Wide screens: the title and Create live in the table's toolbar. */}
      {isCompact && <N1PageHeader title={S.title} right={createButton} />}
      {isCompact && <StatGrid items={statItems} variant="muted" />}
      {/* The table shows its own loading state; AsyncContent only takes over
          when the first load fails. */}
      <AsyncContent
        status={firstLoad ? 'succeeded' : status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        <N1Table
          loading={firstLoad}
          columns={columns}
          data={pager.pageItems}
          keyExtractor={o => o.id}
          onRowPress={openDetails}
          renderCompactItem={renderCompactItem}
          toolbarTitle={isCompact ? undefined : S.title}
          toolbar={toolbar}
          scrollable={!isCompact}
          minWidth={TABLE_MIN_WIDTH}
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
                page={pager.page}
                pageCount={pager.pageCount}
                onPageChange={pager.goTo}
              />
            )
          }
          testID="orders-table"
        />
      </AsyncContent>
    </AdminScreen>
  );
}
