import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  FilterMenu,
  N1Button,
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
import { notifyUnavailable } from '../../../shared/utils';
import { BILLING_STRINGS, QUOTE_STATUS_OPTIONS } from '../constants';
import { useInvoices, useQuoteStats, useQuotes } from '../hooks/useBilling';
import { isQuoteMapped } from '../workflow';
import { useConvertToOrder } from '../hooks/useBillingWorkflow';
import type { Quote, QuoteFilters } from '../types';
import {
  INITIAL_QUOTE_FILTERS,
  matchesQuoteFilters,
  quoteSearchText,
} from '../utils';
import { QuoteStatusBadge } from './BillingBadges';
import { QuoteCard } from './BillingCards';

const S = BILLING_STRINGS.quotes;

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  // Matches the filled search and filter next to them in the toolbar.
  toolbarButton: { borderRadius: t.radius.sm },
}));

type Props = {
  /** Wide screens: shown at the left of the table toolbar (the tab switcher). */
  toolbarStart?: ReactNode;
};

export function QuotesTab({ toolbarStart }: Props) {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<BillingNavigation>();
  const toOrder = useConvertToOrder();
  const { items: invoices } = useInvoices();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useQuotes();
  const stats = useQuoteStats();
  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: quoteSearchText,
      initialFilters: INITIAL_QUOTE_FILTERS,
      matchesFilters: matchesQuoteFilters,
    },
  );
  const pager = usePagination(filtered);

  const filterGroups = useMemo(
    () => [
      {
        key: 'status',
        label: BILLING_STRINGS.statusFilter,
        options: QUOTE_STATUS_OPTIONS,
      },
    ],
    [],
  );
  const applyFilters = useCallback(
    (next: FilterValues) =>
      setFilter('status', [...(next.status ?? [])] as QuoteFilters['status']),
    [setFilter],
  );
  const createQuote = useCallback(
    () => navigation.navigate('QuoteForm'),
    [navigation],
  );

  const view = useCallback(
    (q: Quote) => navigation.navigate('QuoteDetails', { quoteId: q.id }),
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
        key: 'accepted',
        label: S.stats.accepted,
        value: stats.accepted,
        tone: 'success' as const,
      },
      {
        key: 'pending',
        label: S.stats.pending,
        value: stats.pending,
        tone: 'warning' as const,
      },
      {
        key: 'rejected',
        label: S.stats.rejected,
        value: stats.rejected,
        tone: 'danger' as const,
      },
    ],
    [stats],
  );

  const columns = useMemo<N1TableColumn<Quote>[]>(
    () => [
      {
        key: 'id',
        title: S.columns.id,
        render: q => <N1Text weight="bold">{q.id}</N1Text>,
      },
      { key: 'customerName', title: S.columns.customer, flex: 2 },
      {
        key: 'status',
        title: S.columns.status,
        render: q => <QuoteStatusBadge status={q.status} />,
      },
      {
        key: 'actions',
        interactive: true,
        title: S.columns.actions,
        render: q => (
          <View style={styles.actions}>
            <N1IconButton
              icon="eye"
              size="sm"
              accessibilityLabel={BILLING_STRINGS.a11y.view(q.id)}
              onPress={() => view(q)}
            />
            {!isQuoteMapped(q, invoices) && (
              <N1IconButton
                icon="package"
                variant="primary"
                size="sm"
                accessibilityLabel={S.convertA11y(q.id)}
                disabled={toOrder.convertingId !== null}
                onPress={() => toOrder.convert(q)}
                testID={`convert-${q.id}`}
              />
            )}
          </View>
        ),
      },
    ],
    [view, styles, toOrder, invoices],
  );

  const renderCompactItem = useCallback(
    (q: Quote) => <QuoteCard quote={q} onView={view} />,
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
        testID="quotes-filter"
      />
      {!isCompact && (
        <>
          <N1Button
            title={BILLING_STRINGS.export}
            leftIcon="download"
            variant="secondary"
            size="sm"
            onPress={exportList}
            style={styles.toolbarButton}
          />
          {/* Phones keep Create in the page header. */}
          <N1Button
            title={S.create}
            leftIcon="plus"
            size="sm"
            onPress={createQuote}
            style={styles.toolbarButton}
            testID="create-quote"
          />
        </>
      )}
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
        <StatGrid items={statItems} variant="muted" testID="quote-stats" />
      )}
      <N1Table
        loading={firstLoad}
        columns={columns}
        data={pager.pageItems}
        keyExtractor={q => q.id}
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
              summary={isCompact ? showing : S.summary(showing, stats)}
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
        testID="quotes-table"
      />
    </AsyncContent>
  );
}
