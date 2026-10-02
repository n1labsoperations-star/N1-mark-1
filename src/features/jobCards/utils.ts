import type { N1DropDownOption, N1StepStatus } from '../../shared/components';
import { ALL, matchesOption } from '../../shared/hooks';
import { percentOf } from '../../shared/utils';
import { JOB_CARD_STRINGS } from './constants';
import type {
  JobCard,
  JobCardFilters,
  JobCardInput,
  JobCardStatus,
  JobOperation,
} from './types';

const isDone = (op: JobOperation) => op.status === 'completed';
const isStarted = (op: JobOperation) =>
  op.status === 'running' || op.status === 'paused';

/** "Bracket — Job A" */
export const jobTitle = (c: Pick<JobCard, 'partName' | 'jobName'>) =>
  [c.partName, c.jobName].filter(Boolean).join(' — ');

/** "WO #1042 · Bracket — Job A" */
export const jobHeading = (c: JobCard) =>
  [JOB_CARD_STRINGS.workOrder(c.id), jobTitle(c)].filter(Boolean).join(' · ');

/** "WO #1042 · Acme Metalworks" */
export const jobCustomerHeading = (c: JobCard) =>
  [JOB_CARD_STRINGS.workOrder(c.id), c.customerName]
    .filter(Boolean)
    .join(' · ');

/** The step on the machine now, else the next to run; the last once all are done. */
export function currentOperation(c: JobCard): JobOperation | undefined {
  return (
    c.operations.find(isStarted) ??
    c.operations.find(op => !isDone(op)) ??
    c.operations[c.operations.length - 1]
  );
}

/** Completed steps count fully, a started step counts half. */
export function jobProgress(c: JobCard): number {
  const done = c.operations.filter(isDone).length;
  const started = c.operations.filter(isStarted).length;
  return percentOf(done * 2 + started, c.operations.length * 2);
}

/** Bar colour: amber while under half done, green when finished. */
export const progressTone = (value: number) =>
  value >= 100 ? 'success' : value < 50 ? 'warning' : 'info';

/** Card status that follows from its operations. */
export function statusFor(operations: JobOperation[]): JobCardStatus {
  if (operations.length > 0 && operations.every(isDone)) {
    return 'completed';
  }
  if (operations.some(op => op.status === 'running')) {
    return 'in_progress';
  }
  if (operations.some(op => op.status === 'paused')) {
    return 'paused';
  }
  return operations.some(isDone) ? 'in_progress' : 'not_started';
}

const withOperations = (operations: JobOperation[]): JobCardInput => ({
  operations,
  status: statusFor(operations),
});

export const canStart = (c: JobCard) =>
  !c.operations.some(op => op.status === 'running') &&
  c.operations.some(op => !isDone(op));

export const canPauseOrComplete = (c: JobCard) =>
  c.operations.some(op => op.status === 'running');

/** Starts (or resumes) the first step that isn't done. */
export function startOperation(c: JobCard, now: string): JobCardInput {
  const next = c.operations.findIndex(op => !isDone(op));
  return withOperations(
    c.operations.map((op, i) =>
      i === next
        ? { ...op, status: 'running', startedAt: op.startedAt ?? now }
        : op,
    ),
  );
}

export function pauseOperation(c: JobCard): JobCardInput {
  return withOperations(
    c.operations.map(op =>
      op.status === 'running' ? { ...op, status: 'paused' } : op,
    ),
  );
}

export function completeOperation(c: JobCard, now: string): JobCardInput {
  return withOperations(
    c.operations.map(op =>
      op.status === 'running'
        ? { ...op, status: 'completed', completedAt: now }
        : op,
    ),
  );
}

// ---- Create / Edit flow ----

/** One row of the flow editor. `operation` is set for saved steps. */
export type FlowStep = { key: string; name: string; operation?: JobOperation };

export function initialFlowSteps(c: JobCard, blankCount: number): FlowStep[] {
  if (c.operations.length) {
    return c.operations.map(op => ({
      key: op.id,
      name: op.name,
      operation: op,
    }));
  }
  return Array.from({ length: blankCount }, (_, i) => ({
    key: `new-${i}`,
    name: '',
  }));
}

/** Badge state of a flow step. New and unsaved steps are drafts. */
export function stepStatus(step: FlowStep, editing: boolean): N1StepStatus {
  if (!editing) {
    return 'draft';
  }
  const status = step.operation?.status;
  if (status === 'completed') {
    return 'completed';
  }
  return status === 'running' || status === 'paused' ? 'current' : 'upcoming';
}

/** Saved steps keep their progress; renamed or new steps start fresh. */
export const flowInput = (steps: FlowStep[]): JobCardInput =>
  withOperations(flowToOperations(steps));

function flowToOperations(steps: FlowStep[]): JobOperation[] {
  return steps.map((step, i) => {
    const op = step.operation;
    if (op && op.name === step.name) {
      return op;
    }
    if (op && isStarted(op)) {
      return { ...op, name: step.name };
    }
    return {
      id: op?.id ?? `op-${Date.now()}-${i}`,
      name: step.name,
      machine: '',
      operator: '',
      status: 'pending',
      startedAt: null,
      completedAt: null,
    };
  });
}

// ---- List filters ----

export const jobCardSearchText = (c: JobCard) => {
  const op = currentOperation(c);
  return `${c.id} ${jobTitle(c)} ${c.customerName} ${op?.name ?? ''} ${
    op?.machine ?? ''
  } ${op?.operator ?? ''}`;
};

export const matchesJobCardFilters = (c: JobCard, f: JobCardFilters) => {
  const op = currentOperation(c);
  return (
    matchesOption(f.operation, op?.name ?? '') &&
    matchesOption(f.operator, op?.operator ?? '')
  );
};

/** "All …" first, then each distinct value in the list, A–Z. */
export function optionsFrom(
  values: string[],
  allLabel: string,
): N1DropDownOption<string>[] {
  const distinct = [...new Set(values.filter(Boolean))].sort();
  return [
    { value: ALL, label: allLabel },
    ...distinct.map(value => ({ value, label: value })),
  ];
}
