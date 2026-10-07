import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  FilterMenu,
  N1IconButton,
  N1Pagination,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type FilterValues,
  type N1TableColumn,
} from '../../../shared/components';
import type { BillingNavigation } from '../types';
import {
  AsyncContent,
  ListToolbar,
  StatGrid,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useListFilter, usePagination } from '../../../shared/hooks';
import { formatCompactCurrency, formatCurrency } from '../../../shared/utils';
import { BILLING_STRINGS, INVOICE_STATUS_OPTIONS } from '../constants';
import { useInvoiceStats, useInvoices } from '../hooks/useBilling';
import type { Invoice, InvoiceFilters } from '../types';
import {
  INITIAL_INVOICE_FILTERS,
  invoiceSearchText,
  invoiceTotal,
  matchesInvoiceFilters,
} from '../utils';
import { InvoiceStatusBadge } from './BillingBadges';
import { InvoiceCard } from './BillingCards';

const S = BILLING_STRINGS.invoices;

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', gap: t.spacing.sm },
}));

type Props = {
  /** Wide screens: shown at the left of the table toolbar (the tab switcher). */
  toolbarStart?: ReactNode;
};

export function InvoicesTab({ toolbarStart }: Props) {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<BillingNavigation>();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useInvoices();
  const stats = useInvoiceStats();
  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: invoiceSearchText,
      initialFilters: INITIAL_INVOICE_FILTERS,
      matchesFilters: matchesInvoiceFilters,
    },
  );
  const pager = usePagination(filtered);

  const filterGroups = useMemo(
    () => [
      {
        key: 'status',
        label: BILLING_STRINGS.statusFilter,
        options: INVOICE_STATUS_OPTIONS,
      },
    ],
    [],
  );
  const applyFilters = useCallback(
    (next: FilterValues) =>
      setFilter('status', [...(next.status ?? [])] as InvoiceFilters['status']),
    [setFilter],
  );

  const view = useCallback(
    (i: Invoice) => navigation.navigate('InvoiceDetails', { invoiceId: i.id }),
    [navigation],
  );
  const edit = useCallback(
    (i: Invoice) => navigation.navigate('InvoiceEdit', { invoiceId: i.id }),
    [navigation],
  );
  const viewQuote = useCallback(
    (quoteId: string) => navigation.navigate('QuoteDetails', { quoteId }),
    [navigation],
  );

  const statItems = useMemo(
    () => [
      { key: 'total', label: S.stats.total, value: stats.total },
      {
        key: 'paid',
        label: S.stats.paid,
        value: stats.paid,
        tone: 'success' as const,
      },
      {
        key: 'pending',
        label: S.stats.pending,
        value: stats.pending,
        tone: 'warning' as const,
      },
      {
        key: 'month',
        label: S.stats.month,
        value: formatCompactCurrency(stats.thisMonth),
      },
    ],
    [stats],
  );

  const columns = useMemo<N1TableColumn<Invoice>[]>(
    () => [
      {
        key: 'id',
        title: S.columns.invoice,
        flex: 1.3,
        render: i => <N1Text weight="bold">{i.id}</N1Text>,
      },
      { key: 'customerName', title: S.columns.customer, flex: 1.5 },
      { key: 'jobId', title: S.columns.job },
      { key: 'routeCard', title: S.columns.routeCard },
      {
        key: 'amount',
        title: S.columns.amount,
        render: i => (
          <N1Text weight="bold">{formatCurrency(invoiceTotal(i))}</N1Text>
        ),
      },
      {
        key: 'status',
        title: S.columns.status,
        flex: 0.9,
        render: i => <InvoiceStatusBadge status={i.status} />,
      },
      {
        key: 'actions',
        interactive: true,
        title: S.columns.actions,
        flex: 1.2,
        render: i => (
          <View style={styles.actions}>
            <N1IconButton
              icon="eye"
              size="sm"
              accessibilityLabel={BILLING_STRINGS.a11y.view(i.id)}
              onPress={() => view(i)}
            />
            {i.quoteId && (
              // Billed against a quote: open it to compare.
              <N1IconButton
                icon="file"
                size="sm"
                accessibilityLabel={BILLING_STRINGS.a11y.viewQuote(i.quoteId)}
                onPress={() => viewQuote(i.quoteId as string)}
                testID={`view-quote-${i.id}`}
              />
            )}
            <N1IconButton
              icon="edit"
              variant="primary"
              size="sm"
              accessibilityLabel={BILLING_STRINGS.a11y.edit(i.id)}
              onPress={() => edit(i)}
            />
          </View>
        ),
      },
    ],
    [styles, view, edit, viewQuote],
  );

  const renderCompactItem = useCallback(
    (i: Invoice) => <InvoiceCard invoice={i} onView={view} />,
    [view],
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
        testID="invoices-filter"
      />
    </ListToolbar>
  );

  const showing = COMMON_STRINGS.showing(pager.shownCount, pager.total, S.noun);

  return (
    // The table shows its own loading state; AsyncContent only takes over
    // when the first load fails.
    <AsyncContent
      status={firstLoad ? 'succeeded' : status}
      error={error}
      onRetry={reload}
      hasData={items.length > 0}
    >
      {/* Phones keep the stat tiles; wide screens show the totals in the
          pagination bar instead. */}
      {isCompact && (
        <StatGrid items={statItems} variant="muted" testID="invoice-stats" />
      )}
      <N1Table
        loading={firstLoad}
        columns={columns}
        data={pager.pageItems}
        keyExtractor={i => i.id}
        onRowPress={view}
        renderCompactItem={renderCompactItem}
        toolbarStart={isCompact ? undefined : toolbarStart}
        toolbar={toolbar}
        scrollable={!isCompact}
        emptyText={
          items.length ? COMMON_STRINGS.noResults : COMMON_STRINGS.empty
        }
        footer={
          (!isCompact || pager.pageCount > 1) && (
            <N1Pagination
              summary={
                isCompact
                  ? showing
                  : S.summary(
                      showing,
                      stats,
                      formatCompactCurrency(stats.thisMonth),
                    )
              }
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
        testID="invoices-table"
      />
    </AsyncContent>
  );
}
