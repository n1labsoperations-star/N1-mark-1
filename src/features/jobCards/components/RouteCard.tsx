import { memo } from 'react';
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

/** Overall completion bar and one timeline row per operation. */
export const RouteCard = memo(function RouteCardComponent({
  operations,
  progress,
}: {
  operations: JobOperation[];
  progress: number;
}) {
  const styles = useN1Styles(makeStyles);
  if (!operations.length) {
    return <N1Text color="secondary">{D.noFlow}</N1Text>;
  }
  const nextIndex = operations.findIndex(op => op.status === 'pending');
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
          testID={`operation-${op.id}`}
        />
      ))}
    </View>
  );
});
