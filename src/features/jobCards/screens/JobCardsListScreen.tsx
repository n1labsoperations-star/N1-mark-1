import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  AdminScreen,
  AsyncContent,
  ListToolbar,
  N1ConfirmDialog,
  N1IconButton,
  N1PageHeader,
  N1Pagination,
  N1Table,
  N1Text,
  FilterMenu,
  StatGrid,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type FilterValues,
  type N1TableColumn,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import {
  useConfirmDelete,
  useListFilter,
  usePagination,
} from '../../../shared/hooks';
import { notifyUnavailable } from '../../../shared/utils';
import {
  DocumentViewer,
  type ViewerTarget,
} from '../../orders/components/DocumentViewer';
import { ORDER_STRINGS } from '../../orders/constants';
import { useOrders } from '../../orders/hooks/useOrders';
import { FlowActionButton } from '../components/FlowActionButton';
import { JobCardStatusBadge } from '../components/JobCardBadges';
import { JobCardCard } from '../components/JobCardCard';
import { JobProgress } from '../components/JobProgress';
import { INITIAL_JOB_CARD_FILTERS, JOB_CARD_STRINGS as S } from '../constants';
import { useJobCardStats, useJobCards } from '../hooks/useJobCards';
import type { JobCard, JobCardFilters, JobCardsNavigation } from '../types';
import {
  currentOperation,
  distinctOptions,
  jobCardSearchText,
  jobProgress,
  jobTitle,
  matchesJobCardFilters,
} from '../utils';

const makeStyles = createN1Styles(t => ({
  actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
}));

const dash = (value?: string) => value || COMMON_STRINGS.dash;
const printDrawing = () => notifyUnavailable(ORDER_STRINGS.details.printAction);
const download = () => notifyUnavailable(ORDER_STRINGS.details.downloadAction);

export function JobCardsListScreen() {
  const styles = useN1Styles(makeStyles);
  const navigation = useNavigation<JobCardsNavigation>();
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload, remove, deletingId, deleteError } =
    useJobCards();
  const deletion = useConfirmDelete<JobCard>(remove, deletingId, deleteError);
  const requestDelete = deletion.request;
  const stats = useJobCardStats();

  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: jobCardSearchText,
      initialFilters: INITIAL_JOB_CARD_FILTERS,
      matchesFilters: matchesJobCardFilters,
    },
  );
  const pager = usePagination(filtered);

  const filterGroups = useMemo(
    () => [
      {
        key: 'operation',
        label: S.operationFilter,
        options: distinctOptions(
          items.map(c => currentOperation(c)?.name ?? ''),
        ),
      },
      {
        key: 'operator',
        label: S.operatorFilter,
        options: distinctOptions(
          items.map(c => currentOperation(c)?.operator ?? ''),
        ),
      },
      {
        key: 'machine',
        label: S.machineFilter,
        options: distinctOptions(
          items.map(c => currentOperation(c)?.machine ?? ''),
        ),
      },
    ],
    [items],
  );
  const applyFilters = useCallback(
    (next: FilterValues) => {
      setFilter('operation', [
        ...(next.operation ?? []),
      ] as JobCardFilters['operation']);
      setFilter('operator', [
        ...(next.operator ?? []),
      ] as JobCardFilters['operator']);
      setFilter('machine', [
        ...(next.machine ?? []),
      ] as JobCardFilters['machine']);
    },
    [setFilter],
  );

  const openDetails = useCallback(
    (c: JobCard) => navigation.navigate('JobCardDetails', { jobCardId: c.id }),
    [navigation],
  );
  const openFlow = useCallback(
    (c: JobCard) =>
      navigation.navigate('JobCardDetails', {
        jobCardId: c.id,
        editFlow: true,
      }),
    [navigation],
  );
  // The diagram opens full size, numbered by its order's drawing number.
  const { items: orders } = useOrders();
  const [viewing, setViewing] = useState<ViewerTarget | null>(null);
  const closeViewer = useCallback(() => setViewing(null), []);
  const openDrawing = useCallback(
    (c: JobCard) =>
      setViewing({
        type: 'drawing',
        drawingNumber:
          orders.find(o => o.id === c.id)?.drawingNumber ||
          c.designFile?.name ||
          S.details.noDrawing,
      }),
    [orders],
  );

  const columns = useMemo<N1TableColumn<JobCard>[]>(
    () => [
      {
        key: 'order',
        title: S.columns.order,
        flex: 0.8,
        // Job ID, with its work order small beneath it.
        render: c => (
          <View>
            <N1Text weight="bold" numberOfLines={1}>
              {S.jobCardNumber(c.code)}
            </N1Text>
            <N1Text variant="caption" color="secondary" numberOfLines={1}>
              {S.workOrder(c.id)}
            </N1Text>
          </View>
        ),
      },
      {
        key: 'part',
        title: S.columns.part,
        flex: 1.2,
        render: c => <N1Text>{dash(jobTitle(c))}</N1Text>,
      },
      {
        key: 'status',
        title: S.columns.status,
        render: c => <JobCardStatusBadge jobCard={c} />,
      },
      {
        key: 'machine',
        title: S.columns.machine,
        render: c => <N1Text>{dash(currentOperation(c)?.machine)}</N1Text>,
      },
      {
        key: 'operator',
        title: S.columns.operator,
        render: c => <N1Text>{dash(currentOperation(c)?.operator)}</N1Text>,
      },
      {
        key: 'diagram',
        title: S.columns.diagram,
        flex: 0.6,
        interactive: true,
        render: c => (
          <N1IconButton
            icon="file"
            variant="soft"
            size="sm"
            accessibilityLabel={S.a11y.diagram(c.id)}
            onPress={() => openDrawing(c)}
            disabled={!c.designFile}
            testID={`diagram-${c.id}`}
          />
        ),
      },
      {
        key: 'progress',
        title: S.columns.progress,
        render: c => (
          <JobProgress value={jobProgress(c)} testID={`progress-${c.id}`} />
        ),
      },
      {
        key: 'actions',
        title: S.columns.actions,
        flex: 0.7,
        align: 'right',
        interactive: true,
        render: c => (
          <View style={styles.actions}>
            <FlowActionButton jobCard={c} onPress={openFlow} />
            <N1IconButton
              icon="trash"
              variant="danger"
              size="sm"
              accessibilityLabel={S.a11y.delete(c.id)}
              onPress={() => requestDelete(c)}
              testID={`delete-${c.id}`}
            />
          </View>
        ),
      },
    ],
    [styles, openFlow, requestDelete, openDrawing],
  );

  const renderCompactItem = useCallback(
    (c: JobCard) => (
      <JobCardCard jobCard={c} onView={openDetails} onFlow={openFlow} />
    ),
    [openDetails, openFlow],
  );

  const statItems = useMemo(
    () => [
      { key: 'active', label: S.stats.active, value: stats.active },
      { key: 'completed', label: S.stats.completed, value: stats.completed },
    ],
    [stats],
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
        testID="job-cards-filter"
      />
    </ListToolbar>
  );

  return (
    <AdminScreen testID="job-cards-screen" fixed>
      {/* Wide screens: the title lives in the table's toolbar. */}
      {isCompact && <N1PageHeader title={S.title} />}
      {isCompact && (
        <StatGrid items={statItems} variant="muted" testID="job-card-stats" />
      )}
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
          keyExtractor={c => c.id}
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
          testID="job-cards-table"
        />
      </AsyncContent>
      <N1ConfirmDialog
        visible={deletion.target !== null}
        title={S.delete.title}
        message={deletion.target ? S.delete.message(deletion.target.id) : ''}
        confirmLabel={S.delete.confirm}
        tone="danger"
        icon="trash"
        loading={deletion.loading}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
        testID="delete-job-card-dialog"
      />
      <DocumentViewer
        target={viewing}
        onClose={closeViewer}
        onPrint={printDrawing}
        onDownload={download}
        onOpen={null}
      />
    </AdminScreen>
  );
}
