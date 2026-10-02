import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1IconButton,
  N1Pagination,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import type { BillingNavigation } from '../types';
import {
  AsyncContent,
  ListToolbar,
  StatGrid,
  ToolbarFilter,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import {
  matchesOption,
  useListFilter,
  usePagination,
} from '../../../shared/hooks';
import {
  formatCompactCurrency,
  formatCurrency,
  notifyUnavailable,
} from '../../../shared/utils';
import { BILLING_STRINGS, INVOICE_FILTER_OPTIONS } from '../constants';
import { useInvoiceStats, useInvoices } from '../hooks/useBilling';
import type { Invoice, InvoiceStatus } from '../types';
import { invoiceSearchText, invoiceTotal } from '../utils';
import { InvoiceStatusBadge } from './BillingBadges';
import { InvoiceCard } from './BillingCards';

const S = BILLING_STRINGS.invoices;
type Filters = { status: InvoiceStatus | 'all' };
const INITIAL: Filters = { status: 'all' };
const matches = (i: Invoice, f: Filters) => matchesOption(f.status, i.status);

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', gap: t.spacing.sm },
}));

export function InvoicesTab() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<BillingNavigation>();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useInvoices();
  const stats = useInvoiceStats();
  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: invoiceSearchText,
      initialFilters: INITIAL,
      matchesFilters: matches,
    },
  );
  const pager = usePagination(filtered);

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
  const exportList = useCallback(
    () => notifyUnavailable(BILLING_STRINGS.exportAction),
    [],
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

  return (
    <AsyncContent
      status={status}
      error={error}
      onRetry={reload}
      hasData={items.length > 0}
    >
      <StatGrid
        items={statItems}
        variant={isCompact ? 'muted' : 'surface'}
        testID="invoice-stats"
      />
      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={S.search}
      >
        <ToolbarFilter
          label={BILLING_STRINGS.statusFilter}
          options={INVOICE_FILTER_OPTIONS}
          value={filters.status}
          onChange={v => setFilter('status', v)}
          testID="filter-invoice-status"
        />
        {!isCompact && (
          <N1Button
            title={BILLING_STRINGS.export}
            leftIcon="download"
            variant="secondary"
            onPress={exportList}
          />
        )}
      </ListToolbar>
      <N1Table
        columns={columns}
        data={pager.pageItems}
        keyExtractor={i => i.id}
        onRowPress={view}
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
        testID="invoices-table"
      />
    </AsyncContent>
  );
}
