import { useCallback, useMemo, useState } from 'react';
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
} from '../../../N1Modules';
import {
  AdminScreen,
  AsyncContent,
  StatGrid,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { usePagination } from '../../../shared/hooks';
import { useOrganizationName } from '../../profile';
import { CurrentWork } from '../components/CurrentWork';
import { MachineStatusBadge } from '../components/MachineBadge';
import { MachineCard } from '../components/MachineCard';
import { MachineFormModal } from '../components/MachineFormModal';
import { MACHINE_STRINGS as S, MACHINE_TYPE_LABELS } from '../constants';
import { useMachineStats, useMachines } from '../hooks/useMachines';
import type { Machine } from '../types';

type FormTarget = { machine: Machine | null } | null;

export function MachinesListScreen() {
  const { isCompact } = useN1Breakpoint();
  const organizationName = useOrganizationName();
  const { items, status, error, reload } = useMachines();
  const stats = useMachineStats();
  const pager = usePagination(items);

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
          <N1Button
            title={S.edit}
            leftIcon="edit"
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
      onPress={openCreate}
      testID="add-machine"
    />
  );

  return (
    <AdminScreen testID="machines-screen">
      <N1PageHeader
        title={S.title}
        subtitle={isCompact ? undefined : S.subtitle(organizationName)}
        right={addButton}
      />
      <AsyncContent
        status={status}
        error={error}
        onRetry={reload}
        hasData={items.length > 0}
      >
        <StatGrid
          items={statItems}
          variant={isCompact ? 'muted' : 'surface'}
          testID="machine-stats"
        />
        <N1Table
          columns={columns}
          data={pager.pageItems}
          keyExtractor={m => m.id}
          renderCompactItem={renderCompactItem}
          footer={
            pager.pageCount > 1 && (
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
