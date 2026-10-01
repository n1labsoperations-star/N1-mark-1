import { DAY_MS, isoAgo } from '../../../services/mock/mockServer';
import type { Invoice, LineItem, Quote } from '../types';

// Rates are per minute; ₹80/3 shows as ₹26.67 and keeps the design's round amounts.
const SHAFT_OPERATIONS: LineItem[] = [
  {
    id: 'op1',
    operation: 'Facing',
    description: 'OD facing both ends',
    minutesPerPiece: 2,
    ratePerMinute: 30,
  },
  {
    id: 'op2',
    operation: 'Turning',
    description: 'Turn to ⌀28 mm',
    minutesPerPiece: 5,
    ratePerMinute: 20,
  },
  {
    id: 'op3',
    operation: 'Drilling',
    description: 'Drill ⌀10 mm through',
    minutesPerPiece: 2,
    ratePerMinute: 80 / 3,
  },
  {
    id: 'op4',
    operation: 'Grinding',
    description: 'Finish grind OD',
    minutesPerPiece: 2,
    ratePerMinute: 80 / 3,
  },
];

const BRACKET_OPERATIONS: LineItem[] = [
  {
    id: 'op1',
    operation: 'Cutting',
    description: 'Saw cut to length',
    minutesPerPiece: 1,
    ratePerMinute: 25,
  },
  {
    id: 'op2',
    operation: 'Milling',
    description: 'Face and slot',
    minutesPerPiece: 4,
    ratePerMinute: 30,
  },
  {
    id: 'op3',
    operation: 'Welding',
    description: 'Tack and full weld',
    minutesPerPiece: 3,
    ratePerMinute: 35,
  },
];

const FLANGE_OPERATIONS: LineItem[] = [
  {
    id: 'op1',
    operation: 'Turning',
    description: 'Face and bore',
    minutesPerPiece: 6,
    ratePerMinute: 22,
  },
  {
    id: 'op2',
    operation: 'Drilling',
    description: 'PCD holes ×6',
    minutesPerPiece: 3,
    ratePerMinute: 25,
  },
];

type InvoiceSeed = Omit<Invoice, 'discount' | 'notes' | 'lineItems'> &
  Partial<Pick<Invoice, 'discount' | 'notes'>> & { lineItems?: LineItem[] };

const invoice = (seed: InvoiceSeed): Invoice => ({
  discount: 0,
  notes: '',
  lineItems: SHAFT_OPERATIONS,
  ...seed,
});

export const MOCK_INVOICES: Invoice[] = [
  invoice({
    id: 'INV-2026-0125',
    customerName: 'ABC Engineering',
    jobId: 'WO-00125',
    routeCard: 'RC-2225',
    partName: 'Machined Shaft',
    quantity: 150,
    status: 'draft',
    issuedAt: isoAgo(DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0124',
    customerName: 'Sri Metal Works',
    jobId: 'WO-00118',
    routeCard: 'RC-2218',
    partName: 'Bracket',
    quantity: 35,
    status: 'paid',
    lineItems: BRACKET_OPERATIONS,
    issuedAt: isoAgo(3 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0123',
    customerName: 'Acme Metalworks',
    jobId: 'WO-00117',
    routeCard: 'RC-2217',
    partName: 'Machined Shaft',
    quantity: 230,
    status: 'paid',
    issuedAt: isoAgo(5 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0122',
    customerName: 'Bright Steel Co.',
    jobId: 'WO-00114',
    routeCard: 'RC-2214',
    partName: 'Flange',
    quantity: 132,
    status: 'overdue',
    lineItems: FLANGE_OPERATIONS,
    issuedAt: isoAgo(40 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0121',
    customerName: 'Nova Fabrication',
    jobId: 'WO-00110',
    routeCard: 'RC-2210',
    partName: 'Bracket',
    quantity: 68,
    status: 'paid',
    lineItems: BRACKET_OPERATIONS,
    issuedAt: isoAgo(8 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0120',
    customerName: 'Silverline Industries',
    jobId: 'WO-00107',
    routeCard: 'RC-2207',
    partName: 'Housing',
    quantity: 78,
    status: 'pending',
    issuedAt: isoAgo(10 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0119',
    customerName: 'Meridian Components',
    jobId: 'WO-00103',
    routeCard: 'RC-2203',
    partName: 'Machined Shaft',
    quantity: 208,
    status: 'paid',
    discount: 2000,
    issuedAt: isoAgo(12 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0118',
    customerName: 'Acme Metalworks',
    jobId: 'WO-00101',
    routeCard: 'RC-2201',
    partName: 'Bracket',
    quantity: 120,
    status: 'pending',
    lineItems: BRACKET_OPERATIONS,
    issuedAt: isoAgo(15 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0117',
    customerName: 'Bright Steel Co.',
    jobId: 'WO-00098',
    routeCard: 'RC-2198',
    partName: 'Flange',
    quantity: 90,
    status: 'paid',
    lineItems: FLANGE_OPERATIONS,
    issuedAt: isoAgo(33 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0116',
    customerName: 'Nova Fabrication',
    jobId: 'WO-00095',
    routeCard: 'RC-2195',
    partName: 'Machined Shaft',
    quantity: 60,
    status: 'paid',
    issuedAt: isoAgo(36 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0115',
    customerName: 'Silverline Industries',
    jobId: 'WO-00092',
    routeCard: 'RC-2192',
    partName: 'Housing',
    quantity: 45,
    status: 'overdue',
    issuedAt: isoAgo(48 * DAY_MS),
  }),
  invoice({
    id: 'INV-2026-0114',
    customerName: 'Meridian Components',
    jobId: 'WO-00090',
    routeCard: 'RC-2190',
    partName: 'Bracket',
    quantity: 50,
    status: 'paid',
    lineItems: BRACKET_OPERATIONS,
    issuedAt: isoAgo(52 * DAY_MS),
  }),
];

type QuoteSeed = Omit<
  Quote,
  'lineItems' | 'material' | 'partName' | 'quantity'
> &
  Partial<Pick<Quote, 'lineItems' | 'material' | 'partName' | 'quantity'>>;

const quote = (seed: QuoteSeed): Quote => ({
  lineItems: SHAFT_OPERATIONS,
  material: 'EN8',
  partName: 'Machined Shaft',
  quantity: 150,
  ...seed,
});

export const MOCK_QUOTES: Quote[] = [
  quote({
    id: 'QT-2026-0042',
    customerName: 'ABC Engineering',
    status: 'sent',
    createdAt: isoAgo(DAY_MS),
  }),
  quote({
    id: 'QT-2026-0041',
    customerName: 'Sri Metal Works',
    status: 'accepted',
    partName: 'Bracket',
    quantity: 80,
    material: 'MS',
    lineItems: BRACKET_OPERATIONS,
    createdAt: isoAgo(2 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0040',
    customerName: 'Acme Metalworks',
    status: 'accepted',
    quantity: 220,
    createdAt: isoAgo(4 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0039',
    customerName: 'Bright Steel Co.',
    status: 'rejected',
    partName: 'Flange',
    quantity: 100,
    material: 'SS304',
    lineItems: FLANGE_OPERATIONS,
    createdAt: isoAgo(6 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0038',
    customerName: 'Nova Fabrication',
    status: 'draft',
    partName: 'Bracket',
    quantity: 60,
    material: 'MS',
    lineItems: BRACKET_OPERATIONS,
    createdAt: isoAgo(7 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0037',
    customerName: 'Silverline Industries',
    status: 'sent',
    partName: 'Housing',
    quantity: 55,
    material: 'AL6061',
    createdAt: isoAgo(9 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0036',
    customerName: 'Meridian Components',
    status: 'accepted',
    quantity: 40,
    createdAt: isoAgo(11 * DAY_MS),
  }),
  quote({
    id: 'QT-2026-0035',
    customerName: 'Bright Steel Co.',
    status: 'rejected',
    partName: 'Flange',
    quantity: 75,
    material: 'SS304',
    lineItems: FLANGE_OPERATIONS,
    createdAt: isoAgo(14 * DAY_MS),
  }),
];
