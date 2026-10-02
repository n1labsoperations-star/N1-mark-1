import { memo, useCallback, useState } from 'react';
import { View } from 'react-native';
import {
  N1ProgressBar,
  N1TimelineItem,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1TimelineStatus,
} from '../../../shared/components';
import { formatTime } from '../../../shared/utils';
import { JOB_CARD_STRINGS } from '../constants';
import type { JobOperation, OperationStatus } from '../types';

const D = JOB_CARD_STRINGS.details;

const TIMELINE_STATUS: Record<OperationStatus, N1TimelineStatus> = {
  completed: 'done',
  running: 'active',
  paused: 'pending',
  pending: 'pending',
};

const makeStyles = createN1Styles(t => ({
  list: { gap: t.spacing.md },
}));

/** The step being worked on: running or paused, else the next to start. */
const currentIndex = (operations: JobOperation[]) => {
  const started = operations.findIndex(
    op => op.status === 'running' || op.status === 'paused',
  );
  if (started >= 0) {
    return started;
  }
  const next = operations.findIndex(op => op.status === 'pending');
  return next >= 0 ? next : operations.length - 1;
};

const assignment = (op: JobOperation) =>
  [op.machine, op.operator].filter(Boolean).join(' · ');

function subtitleFor(op: JobOperation, isNext: boolean) {
  if (op.status === 'pending') {
    return isNext ? D.nextOperation : D.upcoming;
  }
  return assignment(op) || undefined;
}

function metaFor(op: JobOperation) {
  if (op.status === 'completed' && op.completedAt) {
    return D.completedAt(formatTime(op.completedAt));
  }
  if (op.status === 'running' && op.startedAt) {
    return D.startedAt(formatTime(op.startedAt));
  }
  return undefined;
}

/**
 * Overall completion bar and one row per operation. Each row opens and closes
 * on its own; the current step starts open and is highlighted.
 */
export const RouteCard = memo(function RouteCardComponent({
  operations,
  progress,
}: {
  operations: JobOperation[];
  progress: number;
}) {
  const styles = useN1Styles(makeStyles);
  const current = operations.length ? currentIndex(operations) : -1;
  const currentId = operations[current]?.id;
  // Steps the user opened or closed; the rest follow "current is open", so
  // the next step opens by itself when one is completed.
  const [toggled, setToggled] = useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );
  const isOpen = (id: string) => toggled.get(id) ?? id === currentId;
  const toggle = useCallback(
    (id: string, wasOpen: boolean) =>
      setToggled(prev => new Map(prev).set(id, !wasOpen)),
    [],
  );

  if (!operations.length) {
    return <N1Text color="secondary">{D.noFlow}</N1Text>;
  }
  const nextIndex = operations.findIndex(op => op.status === 'pending');
  // Nothing left to work on once every step is done.
  const highlight = operations[current].status === 'completed' ? -1 : current;
  return (
    <View style={styles.list}>
      <N1ProgressBar
        label={D.overall}
        value={progress}
        testID="overall-progress"
      />
      {operations.map((op, i) => (
        <N1TimelineItem
          key={op.id}
          title={op.name}
          subtitle={subtitleFor(op, i === nextIndex)}
          meta={metaFor(op)}
          status={TIMELINE_STATUS[op.status]}
          statusLabel={op.status === 'paused' ? D.paused : undefined}
          highlighted={i === highlight}
          expanded={isOpen(op.id)}
          onToggle={() => toggle(op.id, isOpen(op.id))}
          testID={`operation-${op.id}`}
        />
      ))}
    </View>
  );
});
