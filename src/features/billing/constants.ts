import type { N1DropDownOption, N1Tab } from '../../shared/components';
import type { StatusMeta } from '../../shared/types';
import type { BillingTab, InvoiceStatus, QuoteStatus } from './types';

export const BILLING_STRINGS = {
  title: 'Billing',
  tabs: { invoices: 'Invoices', quotes: 'Quotes' },
  statusFilter: 'Status',
  view: 'View',
  edit: 'Edit',
  a11y: {
    view: (id: string) => `View ${id}`,
    edit: (id: string) => `Edit ${id}`,
    viewQuote: (quoteId: string) => `View quote ${quoteId}`,
  },
  invoices: {
    title: 'Invoices',
    search: 'Search by invoice, customer or WO #',
    noun: 'invoices',
    /** Pagination bar: "Showing 10 of 12 invoices · 7 paid · …". */
    summary: (
      showing: string,
      s: { paid: number; pending: number },
      thisMonth: string,
    ) =>
      `${showing} · ${s.paid} paid · ${s.pending} pending · ${thisMonth} this month`,
    stats: {
      total: 'Total Invoices',
      paid: 'Paid',
      pending: 'Pending',
      month: 'This Month',
    },
    columns: {
      invoice: 'Invoice',
      customer: 'Customer',
      job: 'Job',
      routeCard: 'Route card',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
    },
    clientReference: 'Client reference',
  },
  quotes: {
    create: 'Create Quote',
    createA11y: 'Create quote',
    title: 'Quotes',
    search: 'Search by quote, customer or WO #',
    noun: 'quotes',
    /** Pagination bar: "Showing 10 of 10 quotes · 3 accepted · …". */
    summary: (
      showing: string,
      s: { accepted: number; pending: number; rejected: number },
    ) =>
      `${showing} · ${s.accepted} accepted · ${s.pending} pending · ${s.rejected} rejected`,
    stats: {
      total: 'Total Quotes',
      accepted: 'Accepted',
      pending: 'Pending',
      rejected: 'Rejected',
    },
    columns: {
      id: 'Quote ID',
      customer: 'Customer',
      status: 'Status',
      actions: 'Actions',
    },
    convertA11y: (id: string) => `Convert ${id} to order`,
  },
  dispatch: {
    title: 'Generate dispatch',
    subtitle: (customer: string) =>
      `Bill ${customer} for this job. Attach their quote to bill at its rates, or continue without one.`,
    noQuotes: (customer: string) => `No quotes found for ${customer}.`,
    noQuote: 'No quote',
    pick: 'Pick a quote, or No quote.',
    noQuoteHelp:
      'Bill from the job’s operations; fill in the rates on the invoice.',
    quoteLine: (part: string, quantity: number) => `${part} · ${quantity} pcs`,
    create: 'Create invoice',
    existing: (invoiceId: string) =>
      `This job is already billed on ${invoiceId}.`,
    open: 'Open invoice',
    created: 'Invoice created',
    createdMessage: (invoiceId: string) =>
      `${invoiceId} was added to billing as a draft.`,
  },
  invoice: {
    title: 'Invoice',
    quote: 'Quote',
    viewQuote: 'View Quote',
    subtitle: (id: string, status: string) => `${id} · ${status}`,
    editTitle: 'Edit Invoice',
    customer: 'Customer',
    jobId: 'Job ID',
    partName: 'Part name',
    quantity: 'Quantity',
    status: 'Status',
    additional: 'Additional details',
    discount: 'Discount',
    notes: 'Notes',
    send: 'Send Invoice',
    sendShort: 'Send',
    resendAction: 'Re-sending invoices',
    downloadPdf: 'Download PDF',
    pdfShort: 'PDF',
    downloadAction: 'Downloading PDFs',
    markPaid: 'Mark as Paid',
    notFound: 'This invoice no longer exists.',
  },
  quote: {
    title: 'Quote Detail',
    addTitle: 'Add Quote',
    newSubtitle: 'New quote',
    total: 'Total',
    operations: 'Operations',
    material: 'Material',
    materialPlaceholder: 'e.g. EN8',
    status: 'Status',
    convert: 'Convert to Order',
    order: 'Order',
    orderValue: (orderId: string) => `WO #${orderId}`,
    // "Add Quote" is the design's label for revising an existing quote.
    revise: 'Add Quote',
    downloadPdf: 'Download PDF',
    pdfShort: 'PDF',
    customer: 'Customer',
    customerPlaceholder: 'Enter customer name',
    partName: 'Part name',
    partNamePlaceholder: 'Enter part name',
    quantity: 'Quantity',
    quantityPlaceholder: 'Enter quantity',
    notFound: 'This quote no longer exists.',
  },
  lineItems: {
    title: 'Process operations',
    customizableInvoice: 'Columns are customizable per invoice',
    customizableQuote: 'Columns are customizable per quote',
    customizableShort: 'Customizable',
    operation: 'Operation',
    description: 'Description',
    timeQty: 'Time / Qty',
    rate: 'Rate',
    amount: 'Amount',
    addRow: 'Add row',
    remove: (name: string) => `Remove ${name || 'row'}`,
    minutesUnit: 'min',
    minutesHeader: (qty: number) => `Min / pc × ${qty}`,
    rateHeader: 'Rate (₹/min)',
    rateUnit: '/min',
    operationPlaceholder: 'e.g. Facing',
    descriptionPlaceholder: 'e.g. OD facing both ends',
    perPiece: (qty: number, minutes: number) => `${qty} pcs × ${minutes} min`,
    perMinute: (rate: string) => `${rate}/min`,
    none: 'No operations yet.',
    needsOne: 'Add at least one operation',
  },
  totals: {
    subtotal: 'Subtotal',
    gst: 'GST',
    discount: 'Discount',
    total: 'Total',
    cgst: (rate: string) => `CGST ${rate}`,
    sgst: (rate: string) => `SGST ${rate}`,
    igst: (rate: string) => `IGST ${rate}`,
    noGst: 'GST not applied',
    gstRate: 'GST rate',
    gstRatePlaceholder: 'Select GST rate',
  },
} as const;

export const BILLING_TABS: N1Tab<BillingTab>[] = [
  { key: 'invoices', label: BILLING_STRINGS.tabs.invoices },
  { key: 'quotes', label: BILLING_STRINGS.tabs.quotes },
];

export const INVOICE_STATUS_META: Record<InvoiceStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'warning' },
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
};

export const QUOTE_STATUS_META: Record<QuoteStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export const INVOICE_STATUS_OPTIONS: N1DropDownOption<InvoiceStatus>[] = (
  Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]
).map(value => ({ value, label: INVOICE_STATUS_META[value].label }));

export const QUOTE_STATUS_OPTIONS: N1DropDownOption<QuoteStatus>[] = (
  Object.keys(QUOTE_STATUS_META) as QuoteStatus[]
).map(value => ({ value, label: QUOTE_STATUS_META[value].label }));
