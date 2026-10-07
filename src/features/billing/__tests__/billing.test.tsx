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
    expect(calculateTotals(shaft.lineItems, 150, 0, 5)).toMatchObject({
      subtotal: 40000,
      discount: 0,
      gst: 2000,
      total: 42000,
    });
  });
  test('discount comes off before GST and never exceeds the subtotal', () => {
    expect(calculateTotals(shaft.lineItems, 150, 10000, 5)).toMatchObject({
      subtotal: 40000,
      discount: 10000,
      taxable: 30000,
      gst: 1500,
      total: 31500,
    });
    expect(calculateTotals(shaft.lineItems, 150, 99999, 5).total).toBe(0);
    expect(calculateTotals(shaft.lineItems, 150, -5, 5).discount).toBe(0);
  });
  test('18% GST: CGST + SGST in the same state, IGST across states', () => {
    // ₹40,000 at 18%.
    expect(calculateTotals(shaft.lineItems, 150, 0, 18, 'intra')).toMatchObject(
      { cgst: 3600, sgst: 3600, igst: 0, gst: 7200, total: 47200 },
    );
    expect(calculateTotals(shaft.lineItems, 150, 0, 18, 'inter')).toMatchObject(
      { cgst: 0, sgst: 0, igst: 7200, gst: 7200, total: 47200 },
    );
    expect(calculateTotals(shaft.lineItems, 150, 0, 18, 'none')).toMatchObject({
      gstRate: 0,
      gst: 0,
      total: 40000,
    });
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

const filterStatuses = async (
  root: Parameters<typeof byTestId>[0],
  id: 'invoices-filter' | 'quotes-filter',
  statuses: string[],
) => {
  await press(byTestId(root, id));
  const panel = byTestId(root, `${id}-panel`);
  await press(byText(panel, 'Clear all'));
  for (const status of statuses) {
    await press(byLabel(byTestId(root, `${id}-panel`), status));
  }
  await press(byTestId(root, `${id}-apply`));
};

test('invoices tab: totals, table, filter and search', async () => {
  const { root } = await renderAdmin('Billing');
  // Wide screens: no stat tiles; the totals are in the pagination bar.
  expect(hasTestId(root, 'invoice-stats')).toBe(false);
  const text = allText(byTestId(root, 'invoices-table'));
  expect(text).toContain('INV-2026-0125');
  expect(text).toContain('₹42,000');
  expect(text).toContain('RC-2225');
  expect(text).toContain('Showing 10 of 13 invoices · 8 paid · 3 pending');
  await filterStatuses(root, 'invoices-filter', ['Overdue']);
  expect(allText(root)).toContain('Showing 2 of 2 invoices');
  await filterStatuses(root, 'invoices-filter', []);
  await typeInto(
    byLabel(root, 'Search by invoice, customer or WO #'),
    'meridian',
  );
  expect(allText(root)).toContain('Showing 2 of 2 invoices');
});

test('invoices: two statuses at once, and search by work ID', async () => {
  const { root } = await renderAdmin('Billing');
  await filterStatuses(root, 'invoices-filter', ['Overdue', 'Draft']);
  const text = allText(byTestId(root, 'invoices-table'));
  const overdue = MOCK_INVOICES.filter(i => i.status === 'overdue').length;
  const draft = MOCK_INVOICES.filter(i => i.status === 'draft').length;
  expect(text).toContain(`Showing ${overdue + draft} of ${overdue + draft}`);
  expect(byLabel(root, 'Filter (2)')).toBeTruthy();
  await filterStatuses(root, 'invoices-filter', []);

  const search = byLabel(root, 'Search by invoice, customer or WO #');
  for (const query of ['WO-00125', '125', 'wo125', 'WO #125']) {
    await typeInto(search, query);
    const rows = allText(byTestId(root, 'invoices-table'));
    expect(rows).toContain('INV-2026-0125');
    expect(rows).toContain('Showing 1 of 1');
  }
});

test('wide screens: only the invoice rows scroll; totals stay in view', async () => {
  const { root } = await renderAdmin('Billing');
  const table = byTestId(root, 'invoices-table');
  const scroll = byTestId(table, 'invoices-table-scroll');
  expect(allText(scroll)).toContain('INV-2026-0125');
  expect(allText(scroll)).not.toContain('Showing 10 of 13 invoices');
  expect(allText(table)).toContain('Invoices');
  expect(allText(table)).toContain('Showing 10 of 13 invoices');
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
  const quotes = byTestId(h.root, 'quotes-table');
  expect(allText(quotes)).toContain('3 accepted · 3 pending · 2 rejected');
  // Wide screens: Create quote sits in the Quotes toolbar.
  expect(hasTestId(quotes, 'create-quote')).toBe(true);
  await filterStatuses(h.root, 'quotes-filter', ['Draft']);
  expect(allText(byTestId(h.root, 'quotes-table'))).toContain('QT-2026-0038');
  await filterStatuses(h.root, 'quotes-filter', []);

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
  // QT-2026-0042 is billed on INV-2026-0125: already mapped, no convert.
  expect(() =>
    byTestId(byTestId(h.root, 'quote-details-screen'), 'convert-quote'),
  ).toThrow();

  // Convert to Order creates the order and opens it.
  await h.navigate('QuoteDetails', { quoteId: 'QT-2026-0041' });
  const details = () => {
    const screens = h.root.findAll(
      n =>
        typeof n.type === 'string' && n.props.testID === 'quote-details-screen',
    );
    return screens[screens.length - 1];
  };
  await press(byTestId(details(), 'convert-quote'));
  expect(h.currentRoute()).toBe('OrderDetails');
  const quote = h.store.getState().billing.quotes.entities['QT-2026-0041'];
  expect(quote).toMatchObject({ status: 'accepted' });
  const order = h.store.getState().orders.entities[quote!.orderId!];
  expect(order).toMatchObject({
    customerName: 'Sri Metal Works',
    quoteId: 'QT-2026-0041',
    status: 'new',
  });

  // Mapped now: the convert button is gone and the order is linked instead.
  await h.navigate('QuoteDetails', { quoteId: 'QT-2026-0041' });
  expect(() => byTestId(details(), 'convert-quote')).toThrow();
  expect(allText(byTestId(details(), 'quote-order'))).toBe(`WO #${order!.id}`);
  await press(byTestId(details(), 'quote-order'));
  expect(h.currentRoute()).toBe('OrderDetails');
});

test('quotes list converts a quote to an order from its row', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('Billing', { tab: 'quotes' });
  await press(byLabel(h.root, 'Convert QT-2026-0040 to order'));
  expect(h.currentRoute()).toBe('OrderDetails');
  expect(
    h.store.getState().billing.quotes.entities['QT-2026-0040']?.orderId,
  ).toBeTruthy();

  // Mapped quotes (converted, or billed on an invoice) lose the button.
  await h.navigate('Billing', { tab: 'quotes' });
  expect(() => byLabel(h.root, 'Convert QT-2026-0040 to order')).toThrow();
  expect(() => byLabel(h.root, 'Convert QT-2026-0042 to order')).toThrow();
  expect(byLabel(h.root, 'Convert QT-2026-0041 to order')).toBeTruthy();
});

test('an invoice billed against a quote can open it to compare', async () => {
  const h = await renderAdmin('Billing');
  // From the list…
  await press(byLabel(h.root, 'View quote QT-2026-0042'));
  expect(h.currentRoute()).toBe('QuoteDetails');

  // …and from the invoice.
  await h.navigate('InvoiceDetails', { invoiceId: 'INV-2026-0125' });
  await press(byTestId(h.root, 'view-quote'));
  expect(h.currentRoute()).toBe('QuoteDetails');
  expect(allText(h.root)).toContain('QT-2026-0042');

  // Invoices without a quote have no such button.
  // (Earlier screens stay mounted underneath: check the one on top.)
  await h.navigate('InvoiceDetails', { invoiceId: 'INV-2026-0124' });
  const screens = h.root.findAll(
    n =>
      typeof n.type === 'string' && n.props.testID === 'invoice-details-screen',
  );
  const top = screens[screens.length - 1];
  expect(allText(top)).toContain('INV-2026-0124');
  expect(() => byTestId(top, 'view-quote')).toThrow();
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
  // New quotes use the organization's default GST rate (18%).
  expect(allText(byTestId(form, 'totals-total'))).toBe('₹1,180');
  await choose(form, 'quote-gst-rate', '5%');
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
    gstRate: 5,
  });
});

test('invoice GST: CGST + SGST in state, IGST for another state', async () => {
  const h = await renderAdmin('Billing');
  // ABC Engineering isn't a known customer: treated as the same state.
  await h.navigate('InvoiceDetails', { invoiceId: 'INV-2026-0125' });
  let text = allText(h.root);
  expect(text).toContain('CGST 2.5%');
  expect(text).toContain('SGST 2.5%');
  expect(text).toContain('₹1,000');
  expect(text).toContain('₹42,000');

  // Nova Fabrication is in Karnataka; the organization is in Tamil Nadu.
  await h.navigate('InvoiceDetails', { invoiceId: 'INV-2026-0121' });
  text = allText(h.root);
  expect(text).toContain('IGST 5%');
  expect(text).not.toContain('CGST');
});

test('invoice edit picks the GST rate from the configured rates', async () => {
  const h = await renderAdmin('Billing');
  await h.navigate('InvoiceEdit', { invoiceId: 'INV-2026-0125' });
  await choose(h.root, 'invoice-gst-rate', '18%');
  // ₹40,000 + 18%.
  expect(allText(byTestId(h.root, 'totals-total'))).toBe('₹47,200');
  expect(allText(h.root)).toContain('CGST 9%');
  await press(byTestId(h.root, 'save-invoice'));
  expect(
    h.store.getState().billing.invoices.entities['INV-2026-0125']?.gstRate,
  ).toBe(18);
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

test('table rows use icon buttons for view and edit', async () => {
  const h = await renderAdmin('Billing');
  expect(() => byText(h.root, 'View')).toThrow();
  expect(() => byText(h.root, 'Edit')).toThrow();

  await press(byLabel(h.root, 'View INV-2026-0125'));
  expect(h.currentRoute()).toBe('InvoiceDetails');

  await h.navigate('Billing');
  await press(byLabel(h.root, 'Edit INV-2026-0125'));
  expect(h.currentRoute()).toBe('InvoiceEdit');

  await h.navigate('Billing');
  await press(byText(h.root, 'Quotes'));
  await press(byLabel(h.root, 'View QT-2026-0042'));
  expect(h.currentRoute()).toBe('QuoteDetails');
});

test('wide screens: the Invoices / Quotes tabs sit in the table toolbar', async () => {
  const { root } = await renderAdmin('Billing');
  const tabsIn = (tableId: string) =>
    byTestId(root, tableId)
      .findAll(n => n.props.accessibilityRole === 'tab' && n.props.onPress)
      .map(t => allText(t));

  expect(tabsIn('invoices-table')).toEqual(['Invoices', 'Quotes']);
  const quotesTab = byTestId(root, 'invoices-table').find(
    n =>
      n.props.accessibilityRole === 'tab' &&
      n.props.onPress &&
      allText(n) === 'Quotes',
  );
  await press(quotesTab);
  expect(tabsIn('quotes-table')).toEqual(['Invoices', 'Quotes']);
});
