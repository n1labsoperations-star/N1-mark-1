import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import {
  N1Button,
  N1Pagination,
  N1Table,
  N1Text,
  useN1Breakpoint,
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
import { notifyUnavailable } from '../../../shared/utils';
import { BILLING_STRINGS, QUOTE_FILTER_OPTIONS } from '../constants';
import { useQuoteStats, useQuotes } from '../hooks/useBilling';
import type { Quote, QuoteStatus } from '../types';
import { quoteSearchText } from '../utils';
import { QuoteStatusBadge } from './BillingBadges';
import { QuoteCard } from './BillingCards';

const S = BILLING_STRINGS.quotes;
type Filters = { status: QuoteStatus | 'all' };
const INITIAL: Filters = { status: 'all' };
const matches = (q: Quote, f: Filters) => matchesOption(f.status, q.status);

export function QuotesTab() {
  const navigation = useNavigation<BillingNavigation>();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useQuotes();
  const stats = useQuoteStats();
  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: quoteSearchText,
      initialFilters: INITIAL,
      matchesFilters: matches,
    },
  );
  const pager = usePagination(filtered);

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
          <N1Button
            title={BILLING_STRINGS.view}
            leftIcon="eye"
            variant="secondary"
            size="sm"
            onPress={() => view(q)}
          />
        ),
      },
    ],
    [view],
  );

  const renderCompactItem = useCallback(
    (q: Quote) => <QuoteCard quote={q} onView={view} />,
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
        testID="quote-stats"
      />
      <ListToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={S.search}
      >
        <ToolbarFilter
          label={BILLING_STRINGS.statusFilter}
          options={QUOTE_FILTER_OPTIONS}
          value={filters.status}
          onChange={v => setFilter('status', v)}
          testID="filter-quote-status"
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
        keyExtractor={q => q.id}
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
        testID="quotes-table"
      />
    </AsyncContent>
  );
}
