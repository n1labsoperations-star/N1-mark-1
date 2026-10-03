import type { N1DropDownOption } from '../../shared/components';
import type { StatusMeta } from '../../shared/types';
import type {
  BillingState,
  DesignApproval,
  JobCardFilters,
  JobCardStatus,
  MaterialQc,
  MaterialSource,
  QcResult,
  QuotationStatus,
} from './types';

export const JOB_CARD_STRINGS = {
  /** On a job's card while RM QC has rejected its material. */
  rmQcFailed: 'RM QC failed',
  title: 'Job Cards',
  subtitle:
    'Shop-floor operations in progress, with the machine and operator assigned to each.',
  search: 'Search by WO #, part or operator',
  noun: 'job cards',
  operationFilter: 'Operation',
  operatorFilter: 'Operator',
  machineFilter: 'Assigned machine',
  columns: {
    order: 'Order ID',
    part: 'Part name',
    operation: 'Current operation',
    machine: 'Assigned machine',
    operator: 'Operator',
    diagram: 'Diagram',
    progress: 'Progress',
    actions: 'Actions',
  },
  stats: { active: 'Active jobs', completed: 'Completed' },
  workOrder: (id: string) => `WO #${id}`,
  operator: (name: string) => `Operator: ${name}`,
  quantity: (n: number) => `${n} pcs`,
  view: 'View',
  delete: {
    title: 'Delete job card?',
    message: (id: string) =>
      `This will permanently remove the job card for WO #${id}, with its route card and QC history. This can’t be undone.`,
    confirm: 'Delete job card',
  },
  a11y: {
    view: (id: string) => `View job card WO #${id}`,
    delete: (id: string) => `Delete job card WO #${id}`,
    createFlow: (id: string) => `Create flow for WO #${id}`,
    editFlow: (id: string) => `Edit flow for WO #${id}`,
    diagram: (id: string) => `Open drawing for WO #${id}`,
  },
  openDrawing: 'Opening drawings',
  details: {
    title: 'Job card',
    quickActions: 'Quick actions',
    start: 'Start Operation',
    pause: 'Pause',
    complete: 'Complete',
    print: 'Print Job Card',
    dispatch: 'Generate Dispatch',
    priority: 'Priority:',
    due: 'Due:',
    qty: 'Qty:',
    drawing: 'Drawing / design',
    noDrawing: 'No drawing attached',
    designApproval: (label: string) => `Design approval: ${label}`,
    material: 'Material',
    source: 'Source',
    materialQc: 'Material QC',
    rejectedMaterial: 'Rejected material',
    rmGrade: 'RM grade',
    heatNumber: 'Heat no.',
    rmSize: 'RM size',
    reason: 'Reason',
    reinitiate: 'Re-initiate RM QC',
    routeCard: 'Route card & progress',
    editFlow: 'Edit flow',
    editFlowShort: 'Edit',
    createFlow: 'Create flow',
    noFlow:
      'No process flow yet. Create one to plan the operations for this job.',
    overall: 'Overall completion',
    nextOperation: 'Next operation',
    upcoming: 'Upcoming',
    paused: 'Paused',
    completedAt: (time: string) => `Completed at: ${time}`,
    startedAt: (time: string) => `Started at: ${time}`,
    qcHistory: 'QC history',
    noQc: 'No QC checks logged yet.',
    qcColumns: {
      stage: 'Stage',
      result: 'Result',
      remark: 'Remark',
      date: 'Date',
    },
    quotation: 'Quotation',
    billing: 'Billing',
    notFound: 'This job card no longer exists.',
  },
  flow: {
    createTitle: 'Create flow',
    editTitle: 'Edit flow',
    section: 'Process flow',
    createHelp:
      'Add each operation the material will go through, in the order it should happen.',
    editHelp:
      'Completed steps are locked. Reorder, swap or add the steps still to come.',
    priority: (label: string) => `${label} priority`,
    material: 'Material:',
    qty: 'Qty:',
    due: 'Due:',
    stepPlaceholder: 'Select operation',
    stepLabel: (n: number) => `Operation ${n}`,
    addProcess: 'Add process',
    create: 'Create',
    save: 'Save changes',
    noSteps: 'Add at least one operation',
  },
} as const;

/** Operations a route card can include, in the order they usually run. */
export const JOB_OPERATIONS = [
  'Material QC',
  'Facing (Lathe)',
  'Turning (Lathe)',
  'CNC Turning',
  'CNC Milling',
  'Drilling',
  'Deburring',
  'Welding',
  'Marking',
  'QC Inspection',
  'Final check',
  'Packing',
] as const;

export const OPERATION_OPTIONS: N1DropDownOption<string>[] = JOB_OPERATIONS.map(
  value => ({ value, label: value }),
);

/** Width of the drawing file tile on wide screens. */
export const DRAWING_TILE_WIDTH = 220;

/** Steps a new flow starts with (the Create flow design shows three). */
export const NEW_FLOW_STEPS = 3;

export const JOB_CARD_STATUS_META: Record<JobCardStatus, StatusMeta> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'info' },
  paused: { label: 'Paused', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};

export const DESIGN_APPROVAL_META: Record<DesignApproval, StatusMeta> = {
  approved: { label: 'Approved', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const MATERIAL_SOURCE_LABELS: Record<MaterialSource, string> = {
  company: 'Company purchased',
  customer: 'Customer supplied',
};

export const MATERIAL_QC_META: Record<MaterialQc, StatusMeta> = {
  accepted: { label: 'Accepted', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const QC_RESULT_META: Record<QcResult, StatusMeta> = {
  accepted: { label: 'Accepted', tone: 'success' },
  passed: { label: 'Passed', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const QUOTATION_META: Record<QuotationStatus, StatusMeta> = {
  accepted: { label: 'Accepted', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const BILLING_META: Record<BillingState, StatusMeta> = {
  invoiced: { label: 'Invoiced', tone: 'success' },
  not_invoiced: { label: 'Not invoiced', tone: 'warning' },
};

export const INITIAL_JOB_CARD_FILTERS: JobCardFilters = {
  operation: [],
  operator: [],
  machine: [],
};
