import type { N1DropDownOption } from '../../shared/components';
import type { StatusMeta } from '../../shared/types';
import type { OrderFilters, OrderPriority, OrderStatus } from './types';

export const ORDER_STRINGS = {
  title: 'Orders',
  subtitle:
    'Every work order on the shop floor, sorted by priority and due date.',
  create: 'Create',
  createA11y: 'Create order',
  search: 'Search orders',
  noun: 'orders',
  priorityFilter: 'Priority',
  statusFilter: 'Status',
  allPriorities: 'All priorities',
  columns: {
    order: 'Work order / Part',
    customer: 'Customer',
    material: 'Material / Qty',
    priority: 'Priority',
    status: 'Status',
    due: 'Due date',
  },
  stats: { open: 'Open orders', high: 'High priority' },
  workOrder: (id: string) => `WO #${id}`,
  quantity: (n: number) => `${n} pcs`,
  due: (date: string) => `Due ${date}`,
  details: {
    title: 'Order details',
    compactTitle: 'Order',
    edit: 'Edit order',
    priority: (label: string) => `${label} priority`,
    details: 'Details',
    material: 'Material',
    quantity: 'Quantity',
    dueDate: 'Due date',
    additional: 'Additional details',
    drawing: 'Drawing',
    drawingNo: 'Drawing no',
    printDrawing: 'Print drawing with QR',
    documents: 'Documents',
    noDocuments: 'No documents attached.',
    download: (name: string) => `Download ${name}`,
    downloadAction: 'Downloading documents',
    routeCard: 'Route card',
    routeCardHelp:
      'See the full routing sequence, sign-offs and QC checkpoints logged for this work order.',
    viewRouteCard: 'View route card',
    statusHistory: 'Status history',
    notes: 'Notes',
    notFound: 'This order no longer exists.',
    drawingA11y: (no: string) => `Drawing ${no}`,
  },
  form: {
    createTitle: 'Create order',
    editTitle: 'Edit order',
    step: (n: number) => `Step ${n} of 2`,
    step1Subtitle:
      'All fields are optional — fill in what you have and update the rest later.',
    step2Subtitle: 'Part & material details — all fields are optional.',
    step1Footer:
      'Step 1 of 2 · Customer & order details, next: part & material details',
    step2Footer: 'Step 2 of 2 · Part & material details',
    customerSection: 'Customer & requirement',
    orderSection: 'Order details',
    partSection: 'Part & material details',
    next: 'Next',
    back: 'Back',
    submitCreate: 'Create order',
    submitEdit: 'Save changes',
    designFile: 'Design file',
    designHint: 'Click or drop design file (PDF, DWG, STEP)',
    designHintCompact: 'Upload design file',
    designSample: 'bracket-drawing.pdf',
    purchaseOrder: 'Purchase order',
    poHint: 'Click or drop PO & project documents (PDF, DOCX, XLSX)',
    poHintCompact: 'Upload PO & project documents',
    poSample: 'purchase-order.pdf',
    poKind: 'Purchase order',
    customer: 'Customer',
    customerPlaceholder: 'Select customer',
    customerEmail: 'Customer email',
    customerEmailPlaceholder: 'accounts@company.com',
    poNumber: 'PO number',
    poNumberPlaceholder: 'e.g. PO-8842',
    quantity: 'Quantity',
    quantityPlaceholder: 'e.g. 200',
    description: 'Part / job description',
    descriptionPlaceholder: 'Describe the part or job…',
    priority: 'Priority',
    priorityPlaceholder: 'Select priority',
    deliveryDate: 'Delivery date',
    datePlaceholder: 'DD/MM/YYYY',
    invalidDate: 'Use DD/MM/YYYY',
    routeCardNo: 'Route card no',
    routeCardPlaceholder: 'e.g. RC-2210',
    dcNo: 'DC no',
    dcNoPlaceholder: 'e.g. DC-5561',
    dcDate: 'DC date',
    partNumber: 'Part number',
    partNumberPlaceholder: 'e.g. PN-33021',
    drawingNumber: 'Drawing number',
    drawingNumberPlaceholder: 'e.g. DRW-1187',
    rmPartNumber: 'RM part number',
    rmPartNumberPlaceholder: 'e.g. RM-4092',
    shopOrderNumber: 'Shop order number',
    shopOrderPlaceholder: 'e.g. SO-7734',
    rawMaterialSize: 'Raw material size',
    rawMaterialSizePlaceholder: 'e.g. 25mm dia x 200mm',
    heatNumber: 'Heat number',
    heatNumberPlaceholder: 'e.g. HT-99213',
    projectId: 'Project ID',
    projectIdPlaceholder: 'e.g. PRJ-118',
    rawMaterialGrade: 'Raw material grade',
    rawMaterialGradePlaceholder: 'e.g. EN8, MS, SS304',
  },
} as const;

export const PRIORITY_META: Record<
  OrderPriority,
  StatusMeta & { short: string; rank: number }
> = {
  high: { label: 'High', short: 'HI', tone: 'danger', rank: 0 },
  medium: { label: 'Medium', short: 'MD', tone: 'warning', rank: 1 },
  low: { label: 'Low', short: 'LO', tone: 'success', rank: 2 },
};

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  new: { label: 'New', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'info' },
  qc_pending: { label: 'QC pending', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};

export const PRIORITY_OPTIONS: N1DropDownOption<OrderPriority>[] = (
  Object.keys(PRIORITY_META) as OrderPriority[]
).map(value => ({ value, label: PRIORITY_META[value].label }));

export const PRIORITY_FILTER_OPTIONS: N1DropDownOption<
  OrderFilters['priority']
>[] = [
  { value: 'all', label: ORDER_STRINGS.allPriorities },
  ...PRIORITY_OPTIONS,
];

export const ORDER_STATUS_FILTER_OPTIONS: N1DropDownOption<
  OrderFilters['status']
>[] = [
  { value: 'all', label: 'All statuses' },
  ...(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(value => ({
    value,
    label: ORDER_STATUS_META[value].label,
  })),
];

/** Raw material suppliers (Raw Material Details). */
export const SUPPLIER_OPTIONS: N1DropDownOption<string>[] = [
  'Sri Balaji Steels',
  'Tata Steel Distributors',
  'JSW Steel Service Centre',
  'Hindalco Metals',
  'Jindal Stainless',
].map(name => ({ label: name, value: name }));
