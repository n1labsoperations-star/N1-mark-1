import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
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
import {
  useListFilter,
  useOnSettled,
  usePagination,
} from '../../../shared/hooks';
import { jobCardFromOrder, useJobCards } from '../../jobCards';
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
  materialLine,
  matchesOrderFilters,
  orderSearchText,
  orderTitle,
} from '../utils';

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  // Matches the filled filter next to it in the toolbar.
  toolbarButton: { borderRadius: t.radius.sm },
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

  // Opens the order's job card in Job Cards (Back returns here): its details
  // once it has a route card, else Create flow.
  const openJobCard = useCallback(
    (orderId: string, screen: 'JobCardDetails' | 'JobCardFlow') =>
      navigation.navigate('JobCards', {
        screen,
        params: { jobCardId: orderId },
        initial: false,
      }),
    [navigation],
  );
  const creating = useRef<string | null>(null);
  useOnSettled(jobCards.saving, jobCards.saveError, () => {
    if (creating.current) {
      openJobCard(creating.current, 'JobCardFlow');
      creating.current = null;
    }
  });
  const jobCardFor = useCallback(
    (o: WorkOrder) => jobCards.items.find(c => c.id === o.id),
    [jobCards.items],
  );
  const createJobCard = useCallback(
    (o: WorkOrder) => {
      const existing = jobCardFor(o);
      if (existing) {
        openJobCard(
          o.id,
          existing.operations.length ? 'JobCardDetails' : 'JobCardFlow',
        );
      } else {
        creating.current = o.id;
        jobCards.create(jobCardFromOrder(o));
      }
    },
    [jobCardFor, openJobCard, jobCards],
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
          const hasFlow = Boolean(jobCardFor(o)?.operations.length);
          return (
            <View style={styles.actions}>
              <N1IconButton
                icon="clipboard"
                size="sm"
                accessibilityLabel={
                  hasFlow
                    ? S.a11y.openJobCard(o.id)
                    : S.a11y.createJobCard(o.id)
                }
                disabled={jobCards.status !== 'succeeded' || jobCards.saving}
                onPress={() => createJobCard(o)}
                testID={`job-card-${o.id}`}
              />
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
    [
      styles,
      jobCardFor,
      jobCards.status,
      jobCards.saving,
      createJobCard,
      openEdit,
    ],
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
      style={styles.toolbarButton}
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
