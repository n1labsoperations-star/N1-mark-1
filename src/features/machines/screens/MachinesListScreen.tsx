import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  FilterMenu,
  ListToolbar,
  N1Button,
  N1IconButton,
  N1PageHeader,
  N1Pagination,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
  type FilterValues,
  type N1TableColumn,
} from '../../../shared/components';
import {
  AdminScreen,
  AsyncContent,
  StatGrid,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useListFilter, usePagination } from '../../../shared/hooks';
import { CurrentWork } from '../components/CurrentWork';
import { MachineStatusBadge } from '../components/MachineBadge';
import { MachineCard } from '../components/MachineCard';
import { MachineFormModal } from '../components/MachineFormModal';
import {
  MACHINE_STATUS_OPTIONS,
  MACHINE_STRINGS as S,
  MACHINE_TYPE_LABELS,
} from '../constants';
import { useMachineStats, useMachines } from '../hooks/useMachines';
import type { Machine, MachineFilters } from '../types';
import {
  INITIAL_MACHINE_FILTERS,
  machineSearchText,
  matchesMachineFilters,
} from '../utils';

const makeStyles = createN1Styles(t => ({
  // Matches the filled search and filter next to it in the toolbar.
  toolbarButton: { borderRadius: t.radius.sm },
}));

type FormTarget = { machine: Machine | null } | null;

export function MachinesListScreen() {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { items, status, error, reload } = useMachines();
  const stats = useMachineStats();
  const { query, setQuery, filters, setFilter, filtered } = useListFilter(
    items,
    {
      getSearchText: machineSearchText,
      initialFilters: INITIAL_MACHINE_FILTERS,
      matchesFilters: matchesMachineFilters,
    },
  );
  const pager = usePagination(filtered);

  const filterGroups = useMemo(
    () => [
      {
        key: 'status',
        label: S.statusFilter,
        options: MACHINE_STATUS_OPTIONS,
      },
    ],
    [],
  );
  const applyFilters = useCallback(
    (next: FilterValues) =>
      setFilter('status', [...(next.status ?? [])] as MachineFilters['status']),
    [setFilter],
  );

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const openCreate = useCallback(() => setFormTarget({ machine: null }), []);
  const openEdit = useCallback(
    (machine: Machine) => setFormTarget({ machine }),
    [],
  );
  const closeForm = useCallback(() => setFormTarget(null), []);

  const statItems = useMemo(
    () => [
      { key: 'total', label: S.stats.total, value: stats.total },
      {
        key: 'running',
        label: S.stats.running,
        value: stats.running,
        tone: 'info' as const,
      },
      {
        key: 'idle',
        label: S.stats.idle,
        value: stats.idle,
        tone: 'neutral' as const,
      },
      {
        key: 'maintenance',
        label: isCompact ? S.stats.maintenanceShort : S.stats.maintenance,
        value: stats.maintenance,
        tone: 'warning' as const,
      },
    ],
    [stats, isCompact],
  );

  const columns = useMemo<N1TableColumn<Machine>[]>(
    () => [
      {
        key: 'code',
        title: S.columns.code,
        flex: 0.8,
        render: m => <N1Text color="secondary">{m.code}</N1Text>,
      },
      {
        key: 'name',
        title: S.columns.name,
        flex: 1.4,
        render: m => (
          <View>
            <N1Text weight="bold">{m.name}</N1Text>
            <N1Text variant="caption" color="secondary">
              {m.model}
            </N1Text>
          </View>
        ),
      },
      {
        key: 'type',
        title: S.columns.type,
        render: m => <N1Text>{MACHINE_TYPE_LABELS[m.type]}</N1Text>,
      },
      { key: 'location', title: S.columns.location, flex: 0.8 },
      {
        key: 'work',
        title: S.columns.work,
        flex: 1.8,
        render: m => <CurrentWork work={m.currentWork} />,
      },
      {
        key: 'status',
        title: S.columns.status,
        render: m => <MachineStatusBadge status={m.status} />,
      },
      {
        key: 'actions',
        interactive: true,
        title: S.columns.actions,
        flex: 0.8,
        render: m => (
          <N1IconButton
            icon="edit"
            variant="primary"
            size="sm"
            onPress={() => openEdit(m)}
            accessibilityLabel={S.a11y.edit(m.name)}
          />
        ),
      },
    ],
    [openEdit],
  );

  const renderCompactItem = useCallback(
    (m: Machine) => <MachineCard machine={m} onEdit={openEdit} />,
    [openEdit],
  );

  const addButton = isCompact ? (
    <N1IconButton
      icon="plus"
      variant="primary"
      accessibilityLabel={S.addA11y}
      onPress={openCreate}
      testID="add-machine"
    />
  ) : (
    <N1Button
      title={S.add}
      leftIcon="plus"
      size="sm"
      onPress={openCreate}
      style={styles.toolbarButton}
      testID="add-machine"
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
        testID="machines-filter"
      />
      {!isCompact && addButton}
    </ListToolbar>
  );

  return (
    <AdminScreen testID="machines-screen" fixed>
      {/* Wide screens: the title and Add live in the table's toolbar. */}
      {isCompact && <N1PageHeader title={S.title} right={addButton} />}
      {/* The table shows its own loading state; AsyncContent only takes over
          when the first load fails. */}
      <AsyncContent
        status={firstLoad ? 'succeeded' : status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        {/* Phones keep the stat tiles; wide screens show the totals in the
            pagination bar instead. */}
        {isCompact && (
          <StatGrid items={statItems} variant="muted" testID="machine-stats" />
        )}
        <N1Table
          loading={firstLoad}
          columns={columns}
          data={pager.pageItems}
          keyExtractor={m => m.id}
          renderCompactItem={renderCompactItem}
          toolbarTitle={isCompact ? undefined : S.title}
          toolbar={toolbar}
          scrollable={!isCompact}
          emptyText={
            items.length ? COMMON_STRINGS.noResults : COMMON_STRINGS.empty
          }
          footer={
            !isCompact && (
              <N1Pagination
                summary={S.summary(
                  COMMON_STRINGS.showing(pager.shownCount, pager.total, S.noun),
                  stats,
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
          testID="machines-table"
        />
      </AsyncContent>
      <MachineFormModal
        visible={formTarget !== null}
        machine={formTarget?.machine}
        onClose={closeForm}
      />
    </AdminScreen>
  );
}
