import { Alert, Platform } from 'react-native';
import {
  allText,
  byLabel,
  byTestId,
  byText,
  choose,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';
import { MOCK_INVOICES } from '../api/mockData';
import {
  calculateTotals,
  fromDraft,
  isEmptyDraft,
  isThisMonth,
  lineAmount,
  newDraft,
  rateLabel,
  toDraft,
} from '../utils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(() => jest.restoreAllMocks());

describe('totals', () => {
  const shaft = MOCK_INVOICES[0];
  test('match the design: ₹40,000 + 5% GST = ₹42,000', () => {
    expect(shaft.lineItems.map(i => lineAmount(i, 150))).toEqual([
      9000, 15000, 8000, 8000,
    ]);
    expect(calculateTotals(shaft.lineItems, 150)).toEqual({
      subtotal: 40000,
      discount: 0,
      gst: 2000,
      total: 42000,
    });
  });
  test('discount comes off before GST and never exceeds the subtotal', () => {
    expect(calculateTotals(shaft.lineItems, 150, 10000)).toEqual({
      subtotal: 40000,
      discount: 10000,
      gst: 1500,
      total: 31500,
    });
    expect(calculateTotals(shaft.lineItems, 150, 99999).total).toBe(0);
    expect(calculateTotals(shaft.lineItems, 150, -5).discount).toBe(0);
  });
  test('drafts keep the exact rate until the rate text is edited', () => {
    const drilling = shaft.lineItems[2];
    const draft = toDraft(drilling);
    expect(draft.rate).toBe('26.67');
    expect(fromDraft(draft).ratePerMinute).toBe(drilling.ratePerMinute);
    expect(fromDraft({ ...draft, rate: '26.5' }).ratePerMinute).toBe(26.5);
    expect(rateLabel(drilling)).toBe('₹26.67/min');
    expect(isEmptyDraft(newDraft())).toBe(true);
    expect(newDraft().id).not.toBe(newDraft().id);
  });
  test('isThisMonth', () => {
    expect(isThisMonth('2026-09-03', new Date('2026-09-30'))).toBe(true);
    expect(isThisMonth('2026-08-30', new Date('2026-09-30'))).toBe(false);
  });
});

test('invoices tab: stats, table, filter and search', async () => {
  const { root } = await renderAdmin('Billing');
  expect(allText(byTestId(root, 'stat-total'))).toContain('12');
  expect(allText(byTestId(root, 'stat-paid'))).toContain('7');
  const text = allText(byTestId(root, 'invoices-table'));
  expect(text).toContain('INV-2026-0125');
  expect(text).toContain('₹42,000');
  expect(text).toContain('RC-2225');
  expect(allText(root)).toContain('Showing 10 of 12 invoices');
  await choose(root, 'filter-invoice-status', 'Overdue');
  expect(allText(root)).toContain('Showing 2 of 2 invoices');
  await choose(root, 'filter-invoice-status', 'All statuses');
  await typeInto(byLabel(root, 'Search invoice'), 'meridian');
  expect(allText(root)).toContain('Showing 2 of 2 invoices');
});

test('export explains it is not available yet', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  expect(Platform.OS).not.toBe('web');
  const { root } = await renderAdmin('Billing');
  await press(byText(root, 'Export'));
  expect(alert).toHaveBeenCalledWith(
    'Not available yet',
    'Exporting will work once the backend is connected.',
  );
});

test('invoice details: operations, totals, send and mark as paid', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const h = await renderAdmin('Billing');
  await press(byText(h.root, 'INV-2026-0125'));
  const screen = byTestId(h.root, 'invoice-details-screen');
  const text = allText(screen);
  expect(text).toContain('INV-2026-0125 · Draft');
  expect(text).toContain('150 pcs × 5 min');
  expect(text).toContain('₹20/min');
  expect(allText(byTestId(screen, 'totals-total'))).toBe('₹42,000');

  await press(byTestId(screen, 'send-invoice'));
  expect(
    h.store.getState().billing.invoices.entities['INV-2026-0125'].status,
  ).toBe('pending');
  await press(byTestId(screen, 'send-invoice'));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Not available yet',
    'Re-sending invoices will work once the backend is connected.',
  );
  await press(byText(screen, 'Download PDF'));
  await press(byTestId(screen, 'mark-paid'));
  expect(
    h.store.getState().billing.invoices.entities['INV-2026-0125'].status,
  ).toBe('paid');
  const { props } = byTestId(screen, 'mark-paid');
  expect(props['aria-disabled'] ?? props.accessibilityState?.disabled).toBe(
    true,
  );
});

test('edit invoice: change a rate, add and remove rows, discount, status', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('InvoiceEdit', { invoiceId: 'INV-2026-0125' });
  const screen = byTestId(h.root, 'invoice-edit-screen');
  expect(allText(screen)).toContain('Columns are customizable per invoice');
  expect(allText(byTestId(screen, 'line-op1-amount'))).toBe('₹9,000');

  await typeInto(byTestId(screen, 'line-op1-rate'), '40');
  expect(allText(byTestId(screen, 'line-op1-amount'))).toBe('₹12,000');
  await press(byLabel(screen, 'Remove Grinding'));
  expect(allText(screen)).not.toContain('Finish grind OD');
  await press(byTestId(screen, 'add-line-item'));
  await typeInto(byTestId(screen, 'invoice-discount'), '-1');
  await press(byTestId(screen, 'save-invoice'));
  expect(allText(screen)).toContain('Enter a number');

  await typeInto(byTestId(screen, 'invoice-discount'), '1000');
  await choose(screen, 'invoice-status', 'Pending');
  await press(byTestId(screen, 'save-invoice'));

  const saved = h.store.getState().billing.invoices.entities['INV-2026-0125'];
  expect(saved.status).toBe('pending');
  expect(saved.discount).toBe(1000);
  // The blank added row is dropped; the untouched ₹80/3 rate stays exact.
  expect(saved.lineItems.map(i => i.operation)).toEqual([
    'Facing',
    'Turning',
    'Drilling',
  ]);
  expect(saved.lineItems[2].ratePerMinute).toBeCloseTo(80 / 3, 10);
  expect(h.currentRoute()).toBe('Billing');
});

test('edit invoice needs at least one operation', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('InvoiceEdit', { invoiceId: 'INV-2026-0122' });
  const screen = byTestId(h.root, 'invoice-edit-screen');
  await press(byLabel(screen, 'Remove Turning'));
  await press(byLabel(screen, 'Remove Drilling'));
  await press(byTestId(screen, 'save-invoice'));
  expect(allText(screen)).toContain('Add at least one operation');
});

test('quotes tab, quote details, convert and revise', async () => {
  const h = await renderAdmin('Billing');
  await press(byText(h.root, 'Quotes'));
  expect(allText(byTestId(h.root, 'stat-accepted'))).toContain('3');
  expect(allText(byTestId(h.root, 'stat-pending'))).toContain('3');
  expect(allText(byTestId(h.root, 'stat-rejected'))).toContain('2');
  await choose(h.root, 'filter-quote-status', 'Draft');
  expect(allText(byTestId(h.root, 'quotes-table'))).toContain('QT-2026-0038');
  await choose(h.root, 'filter-quote-status', 'All statuses');

  await press(byText(h.root, 'QT-2026-0042'));
  const screen = byTestId(h.root, 'quote-details-screen');
  expect(allText(byTestId(screen, 'quote-summary'))).toContain('₹42,000');
  expect(allText(screen)).toContain('QT-2026-0042 · Sent');
  await press(byTestId(screen, 'revise-quote'));
  const form = byTestId(h.root, 'quote-form-screen');
  expect(byTestId(form, 'quote-customer').props.value).toBe('ABC Engineering');
  await typeInto(byTestId(form, 'quote-quantity'), '300');
  await press(byTestId(form, 'save-quote'));
  expect(
    h.store.getState().billing.quotes.entities['QT-2026-0042'].quantity,
  ).toBe(300);
  await press(
    byTestId(byTestId(h.root, 'quote-details-screen'), 'convert-quote'),
  );
  expect(h.currentRoute()).toBe('JobCards');
});

test('creates a quote', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('Billing', { tab: 'quotes' });
  await press(byTestId(h.root, 'create-quote'));
  const form = byTestId(h.root, 'quote-form-screen');
  await press(byTestId(form, 'save-quote'));
  expect(allText(form)).toContain('This field is required');
  await typeInto(byTestId(form, 'quote-customer'), 'Kaveri Tools');
  await typeInto(byTestId(form, 'quote-part'), 'Pin');
  await typeInto(byTestId(form, 'quote-quantity'), '100');
  await typeInto(byTestId(form, 'line-new-1-minutes'), '1');
  await typeInto(byTestId(form, 'line-new-1-rate'), '10');
  expect(allText(byTestId(form, 'totals-total'))).toBe('₹1,050');
  await press(byTestId(form, 'save-quote'));
  const created =
    h.store.getState().billing.quotes.entities[
      `QT-${new Date().getFullYear()}-0043`
    ];
  expect(created).toMatchObject({
    customerName: 'Kaveri Tools',
    quantity: 100,
    status: 'draft',
  });
});

test('unknown invoice / quote ids', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('InvoiceDetails', { invoiceId: 'X' });
  expect(allText(h.root)).toContain('This invoice no longer exists.');
  await h.navigate('InvoiceEdit', { invoiceId: 'X' });
  await h.navigate('QuoteDetails', { quoteId: 'X' });
  await h.navigate('QuoteForm', { quoteId: 'X' });
  expect(allText(h.root)).toContain('This quote no longer exists.');
});

test('phone: invoice cards, editor cards and pinned actions', async () => {
  mockWidth = 390;
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const h = await renderAdmin('Billing');
  expect(hasTestId(h.root, 'invoice-card-INV-2026-0125')).toBe(true);
  expect(allText(h.root)).toContain('Client reference');
  await press(byText(byTestId(h.root, 'invoice-card-INV-2026-0125'), 'View'));
  const details = byTestId(h.root, 'invoice-details-screen');
  expect(allText(details)).toContain('Mark as Paid');
  expect(allText(details)).toContain('Facing');
  await press(byText(details, 'PDF'));
  await h.navigate('InvoiceEdit', { invoiceId: 'INV-2026-0125' });
  const edit = byTestId(h.root, 'invoice-edit-screen');
  expect(allText(edit)).toContain('min × 150');
  await h.navigate('Billing', { tab: 'quotes' });
  expect(hasTestId(h.root, 'quote-card-QT-2026-0042')).toBe(true);
});
