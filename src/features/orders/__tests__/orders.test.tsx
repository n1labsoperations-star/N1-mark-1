import ReactTestRenderer from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { Platform } from 'react-native';
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
import { jobCardsApi } from '../../jobCards/api/jobCardsApi';
import { MOCK_ORDERS } from '../api/mockData';
import { ordersApi } from '../api/ordersApi';
import { orderActions } from '../store/ordersSlice';
import {
  formValuesToOrderInput,
  orderToFormValues,
  firstStepWithErrors,
  hasStepErrors,
  validateOrderForm,
} from '../components/orderForm';
import { compareOrders, materialLine, orderTitle } from '../utils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(() => jest.restoreAllMocks());

/** Opens a date field's calendar, goes to the month and taps the day. */
async function pickDate(
  form: ReactTestInstance,
  testID: string,
  [day, month, year]: [number, string, number],
) {
  await press(byTestId(form, testID));
  const shown = () => allText(byTestId(form, `${testID}-month`));
  const target = `${month} ${year}`;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const index = (text: string) => {
    const [m, y] = text.split(' ');
    return Number(y) * 12 + months.indexOf(m);
  };
  while (shown() !== target) {
    const label =
      index(shown()) < index(target) ? 'Next month' : 'Previous month';
    await press(byLabel(byTestId(form, `${testID}-calendar`), label));
  }
  await press(byLabel(form, `${day} ${month} ${year}`));
}

/** Fills Order details' required fields (step 2 must be open). */
async function fillOrderDetails(form: ReactTestInstance) {
  const fields: [string, string][] = [
    ['order-form-po-number', 'PO-9001'],
    ['order-form-part-name', 'Spacer ring'],
    ['order-form-drawing-number', 'DRW-9001'],
    ['order-form-route-card', 'RC-9001'],
    ['order-form-dc-no', 'DC-9001'],
  ];
  for (const [id, value] of fields) {
    await typeInto(byTestId(form, id), value);
  }
  await pickDate(form, 'order-form-delivery', [20, 'October', 2026]);
  await pickDate(form, 'order-form-dc-date', [15, 'October', 2026]);
}

test('list is sorted by priority then due date', async () => {
  const { root } = await renderAdmin('Orders');
  const text = allText(byTestId(root, 'orders-table'));
  // The first page of 12 (Low priority falls to page 2).
  const order = [
    'WO #1042',
    'WO #1040',
    'WO #1037',
    'WO #1033',
    'WO #1043',
    'WO #1039',
    'WO #1041',
    'WO #1036',
    'WO #1034',
    'WO #1044',
  ];
  const positions = order.map(id => text.indexOf(id));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  // PO and RC numbers in place of material / quantity.
  expect(text).toMatch(
    /Work order \/ Part.*Customer.*PO number.*RC number.*Priority.*Status.*Due date.*Actions/,
  );
  expect(text).not.toContain('Material / Qty');
  expect(text).not.toContain('MS Round Bar · 200 pcs');
  expect(text).toMatch(/WO #1042.*Acme Metalworks.*PO-8842.*RC-2210/);
  // Narrow windows scroll the columns sideways, never squeezing them.
  const hscroll = byTestId(root, 'orders-table-hscroll');
  expect(hscroll.props.horizontal).toBe(true);
  expect(allText(hscroll)).toContain('WO #1042');
  expect(allText(root)).toContain('Showing 10 of 12 orders');
});

test('only orders with a job card show the job card button', async () => {
  const h = await renderAdmin('Orders');
  // Example data: a full route, one still to set up, and two with none.
  expect(hasTestId(h.root, 'job-card-1042')).toBe(true);
  expect(hasTestId(h.root, 'job-card-1036')).toBe(true);
  expect(hasTestId(h.root, 'job-card-1043')).toBe(false);
  expect(hasTestId(h.root, 'job-card-1044')).toBe(false);
  // Edit is there either way.
  expect(hasTestId(h.root, 'edit-order-1043')).toBe(true);
  expect(allText(byTestId(h.root, 'orders-table'))).not.toContain('Job card');
  // A job card with its route opens; one without steps opens Create flow.
  await press(byLabel(h.root, 'Open job card for WO #1042'));
  expect(h.currentRoute()).toBe('JobCardDetails');
  await h.navigate('Orders');
  await press(byLabel(h.root, 'Create job card for WO #1036'));
  expect(h.currentRoute()).toBe('JobCardFlow');
});

test('search finds an order by its RC number', async () => {
  const { root } = await renderAdmin('Orders');
  await typeInto(byLabel(root, 'Search by WO #, part or customer'), 'RC-2210');
  expect(allText(byTestId(root, 'orders-table'))).toContain('Showing 1 of 1');
});

test('filters by priority and status, and searches', async () => {
  const { root } = await renderAdmin('Orders');
  const panel = () => byTestId(root, 'orders-filter-panel');
  const tab = (label: string) =>
    panel().find(
      n =>
        n.props.accessibilityRole === 'tab' &&
        n.props.onPress &&
        allText(n).startsWith(label),
    );
  const applyFilters = async (group: string, options: string[]) => {
    await press(byTestId(root, 'orders-filter'));
    await press(byText(panel(), 'Clear all'));
    await press(tab(group));
    for (const option of options) {
      await press(byLabel(panel(), option));
    }
    await press(byTestId(root, 'orders-filter-apply'));
  };

  await applyFilters('Priority', ['Low']);
  expect(allText(byTestId(root, 'orders-table'))).toContain('WO #1038');
  expect(allText(byTestId(root, 'orders-table'))).not.toContain('WO #1042');
  await applyFilters('Status', ['QC pending']);
  expect(allText(root)).toContain('Showing 3 of 3 orders');
  // Multi-select: QC pending or Completed.
  await applyFilters('Status', ['QC pending', 'Completed']);
  expect(allText(root)).toContain('Showing 5 of 5 orders');
  await applyFilters('Status', []);
  await typeInto(byLabel(root, 'Search by WO #, part or customer'), 'coupling');
  expect(allText(root)).toContain('Showing 1 of 1 orders');
});

test('wide screens: the page stays put and only the order rows scroll', async () => {
  const { root } = await renderAdmin('Orders');
  const table = byTestId(root, 'orders-table');
  const scroll = byTestId(table, 'orders-table-scroll');
  expect(allText(scroll)).toContain('WO #1042');
  expect(allText(scroll)).not.toContain('Showing 10 of 12 orders');
  expect(allText(table)).toContain('Showing 10 of 12 orders');
  // Title and Create live in the toolbar.
  expect(allText(table)).toContain('Orders');
  expect(byTestId(table, 'create-order')).toBeTruthy();
});

test('details show the full work order', async () => {
  const h = await renderAdmin('Orders');
  await press(byText(h.root, 'WO #1042'));
  const screen = byTestId(h.root, 'order-details-screen');
  const text = () => allText(screen);
  // Title, badges and the tabs, with the customer alongside.
  expect(text()).toContain('WO #1042 · Bracket — Job A');
  expect(text()).toContain('High priority');
  expect(text()).toMatch(
    /Order details.*Raw material.*Documents.*Job card details/,
  );
  // Customer details: just the name, email and phone.
  const customer = allText(byTestId(screen, 'order-customer'));
  expect(customer).toMatch(
    /Name\|Acme Metalworks\|Email\|accounts@acmemetalworks.com\|Phone number\|\+91/,
  );
  expect(customer).not.toContain('Contact person');
  // One card: the title stays put; only the tab's content scrolls.
  const scroll = byTestId(screen, 'order-details-scroll');
  expect(allText(scroll)).toContain('PO-8842');
  expect(allText(scroll)).not.toContain('WO #1042 · Bracket — Job A');
  expect(hasTestId(scroll, 'edit-order')).toBe(false);

  // Order details (the first tab): overview, dispatch and notes.
  expect(allText(byTestId(screen, 'order-overview'))).toMatch(
    /PO number.*PO-8842.*Delivery date.*02 Oct 2026/,
  );
  expect(text()).toContain('RC-2210');
  expect(text()).toContain('Rework batch');
  expect(text()).not.toContain('HT-99213');

  await press(byTestId(screen, 'order-tab-material'));
  expect(allText(byTestId(screen, 'order-raw-material'))).toContain('HT-99213');
  await press(byTestId(screen, 'order-tab-documents'));
  expect(text()).toContain('PO-8842_project-docs.pdf');
  await press(byTestId(screen, 'order-tab-jobCard'));
  expect(text()).not.toContain('Moved to CNC Turning');
  expect(text()).toContain('Turning (Lathe)');

  // The customer link lives on the Order details tab.
  await press(byTestId(screen, 'order-tab-details'));
  await press(byTestId(screen, 'order-view-customer'));
  expect(h.currentRoute()).toBe('CustomerDetails');
});

test('Back on an order returns to the customer or the list it came from', async () => {
  // From a customer's Orders tab: "Back to customer", back to that customer.
  const h = await renderAdmin('Customers');
  await h.navigate('CustomerDetails', { customerId: 'CUS-1' });
  await press(byTestId(h.root, 'customer-tab-orders'));
  await press(byText(byTestId(h.root, 'customer-details-screen'), 'WO #1042'));
  let screen = byTestId(h.root, 'order-details-screen');
  expect(allText(byTestId(screen, 'order-details-back'))).toBe(
    'Back to customer',
  );
  // Saving an edit keeps where the order came from.
  await press(byTestId(screen, 'edit-order'));
  const form = byTestId(h.root, 'order-form-screen');
  await press(byTestId(form, 'order-step-3'));
  await press(byTestId(form, 'order-form-submit'));
  expect(h.currentRoute()).toBe('OrderDetails');
  screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-details-back'));
  expect(h.currentRoute()).toBe('CustomerDetails');
  expect(allText(byTestId(h.root, 'customer-details-screen'))).toContain(
    'Acme Metalworks',
  );

  // From the orders list: "Back to orders", back to the list.
  await h.navigate('Orders');
  await h.navigate('OrdersList');
  await press(byText(h.root, 'WO #1040'));
  screen = byTestId(h.root, 'order-details-screen');
  expect(allText(byTestId(screen, 'order-details-back'))).toBe(
    'Back to orders',
  );
  await press(byTestId(screen, 'order-details-back'));
  expect(h.currentRoute()).toBe('Orders');
});

test('documents and the drawing open in a viewer with Print', async () => {
  const alert = jest.fn();
  (globalThis as { alert?: unknown }).alert = alert;
  const os = Platform.OS;
  Platform.OS = 'web';
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-tab-documents'));

  // Clicking a document views it; this one isn't stored, so it says so.
  await press(byTestId(screen, 'document-po'));
  let viewer = byTestId(h.root, 'document-viewer');
  expect(allText(viewer)).toContain('PO-8842_project-docs.pdf');
  expect(allText(viewer)).toContain('Purchase order · 640 KB');
  expect(hasTestId(viewer, 'document-viewer-placeholder')).toBe(true);
  await press(byTestId(viewer, 'document-viewer-print'));
  expect(alert).toHaveBeenCalledWith(
    expect.stringContaining('Printing documents will work once'),
  );

  // Each row also has its own View and Print buttons.
  expect(byLabel(screen, 'View drawing.pdf')).toBeTruthy();
  await press(byLabel(screen, 'Print drawing.pdf'));
  expect(alert).toHaveBeenCalledTimes(2);

  // The drawing opens in the viewer too.
  await press(byTestId(screen, 'order-drawing'));
  viewer = byTestId(h.root, 'document-viewer');
  expect(allText(viewer)).toContain('Drawing DRW-1187');
  expect(allText(viewer)).toContain('Print drawing with QR');
  Platform.OS = os;
});

test('an order with a job card lists it; pressing it opens the job card', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  const screen = byTestId(h.root, 'order-details-screen');
  // It already has one, so there's nothing to create.
  expect(hasTestId(screen, 'order-create-job-card')).toBe(false);
  await press(byTestId(screen, 'order-tab-jobCard'));
  const item = allText(byTestId(screen, 'order-job-card-1042'));
  expect(item).toContain('WO #1042');
  expect(item).toContain('Now: Turning (Lathe) · CNC-02 · Arun Prakash');
  expect(item).toContain('42%');
  await press(byTestId(screen, 'order-job-card-1042'));
  expect(h.currentRoute()).toBe('JobCardDetails');
  expect(allText(byTestId(h.root, 'job-card-details-screen'))).toContain(
    'WO #1042 · Acme Metalworks',
  );
});

test('an order without a job card offers Create job card on top', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1043' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-tab-jobCard'));
  expect(allText(screen)).toContain('No job card yet');
  // Create it from the top bar. Its material source is missing, so a popup
  // collects the raw material details first (prefilled with the rest).
  await press(byTestId(screen, 'order-tab-details'));
  await press(byTestId(screen, 'order-create-job-card'));
  const dialog = () => byTestId(h.root, 'rm-dialog');
  expect(allText(dialog())).toContain('WO #1043 is missing some raw material');
  expect(byTestId(dialog(), 'rm-dialog-heatNumber').props.value).toBe(
    'HT-99214',
  );
  await press(byTestId(dialog(), 'rm-dialog-submit'));
  // Material source is still empty: nothing is created yet.
  expect(allText(dialog())).toContain('This field is required');
  expect((await jobCardsApi.list()).some(c => c.id === '1043')).toBe(false);
  await press(byLabel(dialog(), 'In-house'));
  await press(byTestId(dialog(), 'rm-dialog-submit'));
  // Saved on the order, then the job card is made and listed.
  expect(h.store.getState().orders.entities['1043']?.materialSource).toBe(
    'in_house',
  );
  expect((await jobCardsApi.list()).some(c => c.id === '1043')).toBe(true);
  expect(hasTestId(screen, 'order-create-job-card')).toBe(false);
  expect(allText(byTestId(screen, 'order-job-card-1043'))).toContain(
    'No process steps yet',
  );
  await press(byTestId(screen, 'order-job-card-1043'));
  expect(h.currentRoute()).toBe('JobCardDetails');
});

test('Create job card skips the popup when nothing is missing', async () => {
  const h = await renderAdmin('Orders');
  // Give WO #1044 its material source, so every detail is there.
  await ordersApi.update('1044', { materialSource: 'bought_out' });
  await ReactTestRenderer.act(async () => {
    h.store.dispatch(orderActions.fetchRequest());
  });
  await h.navigate('OrderDetails', { orderId: '1044' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-create-job-card'));
  expect(hasTestId(h.root, 'rm-dialog-submit')).toBe(false);
  expect((await jobCardsApi.list()).some(c => c.id === '1044')).toBe(true);
  expect(hasTestId(screen, 'order-job-card-1044')).toBe(true);
});

test('raw material shows pending until every detail is in', async () => {
  const h = await renderAdmin('Orders');
  // WO #1043 has no material source yet.
  await h.navigate('OrderDetails', { orderId: '1043' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-tab-material'));
  expect(allText(screen)).toContain('Pending');
  // Back returns to the list it was opened from.
  await press(byTestId(screen, 'order-details-back'));
  expect(h.currentRoute()).toBe('Orders');
});

test('documents: print and download explain they are not wired yet', async () => {
  const alert = jest.fn();
  (globalThis as { alert?: unknown }).alert = alert;
  const os = Platform.OS;
  Platform.OS = 'web';
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byTestId(screen, 'order-tab-documents'));
  await press(byText(screen, 'Print drawing with QR'));
  expect(alert).toHaveBeenCalledWith(
    expect.stringContaining(
      'Print drawing with QR will work once the backend is connected.',
    ),
  );
  await press(byLabel(screen, 'Download PO-8842_project-docs.pdf'));
  expect(alert).toHaveBeenCalledTimes(2);
  Platform.OS = os;
  expect(hasTestId(screen, 'view-route-card')).toBe(false);
});

test('creates an order over three steps', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  let form = byTestId(h.root, 'order-form-screen');
  const onStep = (n: number) => hasTestId(form, `order-form-step-${n}`);
  expect(allText(form)).toContain('Create order');
  expect(allText(byTestId(form, 'order-stepper'))).toBe(
    '1|Customer|2|Order details|3|Raw material',
  );
  expect(onStep(1)).toBe(true);
  // Steps ahead can't be opened from the stepper yet.
  expect(byTestId(form, 'order-step-3').props.accessibilityState).toMatchObject(
    { disabled: true },
  );

  // Upload boxes first, then the customer; both marked ones are required.
  expect(allText(byTestId(form, 'order-form-step-1'))).toMatch(
    /Design file.*Purchase order.*Customer.*Customer email/,
  );
  await press(byTestId(form, 'order-form-next'));
  expect(onStep(1)).toBe(true);
  expect(allText(form).split('This field is required').length - 1).toBe(2);

  // Typing narrows the customers; picking one fills in their email.
  await typeInto(byTestId(form, 'order-form-customer'), 'nova');
  const list = byTestId(form, 'order-form-customer-list');
  expect(allText(list)).toBe('Nova Fabrication');
  await press(byText(list, 'Nova Fabrication'));
  expect(hasTestId(form, 'order-form-customer-list')).toBe(false);
  expect(byTestId(form, 'order-form-customer').props.value).toBe(
    'Nova Fabrication',
  );
  expect(byTestId(form, 'order-form-email').props.value).toBe(
    'orders@novafab.co.in',
  );
  await press(byTestId(form, 'order-form-design'));
  expect(allText(form)).toContain('bracket-drawing.pdf');
  await press(byTestId(form, 'order-form-next'));
  expect(onStep(2)).toBe(true);

  await typeInto(byTestId(form, 'order-form-quantity'), 'ten');
  await press(byTestId(form, 'order-form-next'));
  expect(allText(form)).toContain('Enter a number');

  // Required fields come first.
  expect(allText(byTestId(form, 'order-form-step-2'))).toMatch(
    /PO number.*Part name.*Drawing number.*Route card no.*DC no.*DC date.*Delivery date.*Priority.*Quantity/,
  );
  // Priority starts at Low.
  expect(allText(byTestId(form, 'order-form-priority'))).toBe('Low');
  // The required fields stop Next until they're filled.
  expect(allText(form).split('This field is required').length - 1).toBe(7);

  await typeInto(byTestId(form, 'order-form-quantity'), '25');
  await fillOrderDetails(form);
  await typeInto(byTestId(form, 'order-form-description'), 'Spacer ring');
  await typeInto(byTestId(form, 'order-form-part-number'), 'PN-40001');
  await choose(form, 'order-form-priority', 'High');
  await press(byTestId(form, 'order-form-next'));
  expect(onStep(3)).toBe(true);
  expect(allText(form)).toContain('Raw material details');
  // Done steps fill in; the current one is a ring.
  expect(hasTestId(form, 'order-step-1-completed')).toBe(true);
  expect(hasTestId(form, 'order-step-3-current')).toBe(true);
  expect(allText(byTestId(form, 'order-form-step-3'))).toMatch(
    /Material source.*Bought out.*In-house.*RM part number.*Raw material size.*Heat number.*Raw material grade/,
  );

  // The stepper goes back to a finished step and forward again.
  await press(byTestId(form, 'order-step-1'));
  expect(onStep(1)).toBe(true);
  await press(byTestId(form, 'order-step-3'));
  expect(onStep(3)).toBe(true);

  form = byTestId(h.root, 'order-form-screen');
  await typeInto(byTestId(form, 'order-form-rm-part-number'), 'RM-77');
  await press(byLabel(form, 'In-house'));
  await press(byTestId(form, 'order-form-submit'));

  expect(h.currentRoute()).toBe('Orders');
  const created = h.store.getState().orders.entities['1045'];
  expect(created).toMatchObject({
    customerId: 'CUS-3',
    customerName: 'Nova Fabrication',
    quantity: 25,
    dueDate: '2026-10-20',
    priority: 'high',
    status: 'new',
    partName: 'Spacer ring',
    partNumber: 'PN-40001',
    dcDate: '2026-10-15',
    rmPartNumber: 'RM-77',
    materialSource: 'in_house',
  });
  expect(created.designFile?.name).toBe('bracket-drawing.pdf');
});

test('edits an existing order and keeps its names', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1040' });
  await press(byTestId(byTestId(h.root, 'order-details-screen'), 'edit-order'));
  const form = byTestId(h.root, 'order-form-screen');
  expect(allText(form)).toContain('Edit order');
  // Editing can open any step straight away.
  await press(byTestId(form, 'order-step-2'));
  expect(byTestId(form, 'order-form-quantity').props.value).toBe('120');
  await typeInto(byTestId(form, 'order-form-quantity'), '150');
  await press(byTestId(form, 'order-form-next'));
  await press(byText(form, 'Back'));
  expect(hasTestId(form, 'order-form-step-2')).toBe(true);
  await press(byTestId(form, 'order-step-3'));
  await press(byTestId(form, 'order-form-submit'));
  // Opened from the order's details, so saving returns there.
  expect(h.currentRoute()).toBe('OrderDetails');
  expect(hasTestId(h.root, 'order-form-screen')).toBe(false);
  expect(h.store.getState().orders.entities['1040']).toMatchObject({
    quantity: 150,
    partName: 'Bracket',
    jobName: 'Job B',
  });
});

test('a typed part name wins over the description', () => {
  const input = formValuesToOrderInput({
    ...orderToFormValues(),
    partName: ' Hub ',
    description: 'Spacer ring',
  });
  expect(input.partName).toBe('Hub');
});

test('a customer not in the list is kept as typed', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  const form = byTestId(h.root, 'order-form-screen');
  await typeInto(byTestId(form, 'order-form-customer'), 'Zenith Tools');
  expect(hasTestId(form, 'order-form-customer-list')).toBe(false);
  expect(allText(form)).toContain('Not in your customers');
  // An exact name (any case) still counts as that customer.
  await typeInto(byTestId(form, 'order-form-customer'), 'acme metalworks');
  expect(allText(form)).not.toContain('Not in your customers');
  expect(byTestId(form, 'order-form-email').props.value).not.toBe('');
  await typeInto(byTestId(form, 'order-form-customer'), 'Zenith Tools');
  await press(byTestId(form, 'order-form-design'));
  await press(byTestId(form, 'order-form-next'));
  await fillOrderDetails(form);
  await press(byTestId(form, 'order-form-next'));
  await press(byTestId(form, 'order-form-submit'));
  const created = Object.values(h.store.getState().orders.entities).find(
    o => o?.customerName === 'Zenith Tools',
  );
  // Left at its default.
  expect(created).toMatchObject({ customerId: '', priority: 'low' });
});

test('the form keeps its buttons pinned and links back', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1040' });
  await press(byTestId(byTestId(h.root, 'order-details-screen'), 'edit-order'));
  const form = byTestId(h.root, 'order-form-screen');
  // Only the fields scroll; the title, stepper and buttons stay put.
  const scroll = byTestId(form, 'order-form-scroll');
  expect(hasTestId(scroll, 'order-form-step-1')).toBe(true);
  expect(hasTestId(scroll, 'order-stepper')).toBe(false);
  expect(hasTestId(scroll, 'order-form-next')).toBe(false);
  expect(allText(form)).not.toContain('All fields are optional');
  // Opened from the order's details, so Back returns there.
  await press(byTestId(form, 'order-form-back-to-list'));
  expect(h.currentRoute()).toBe('OrderDetails');
});

test('marking raw material arrived requires it and adds the job card', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  const form = byTestId(h.root, 'order-form-screen');
  await typeInto(byTestId(form, 'order-form-customer'), 'Zenith Tools');
  await press(byTestId(form, 'order-form-design'));
  await press(byTestId(form, 'order-form-next'));
  await fillOrderDetails(form);
  await press(byTestId(form, 'order-form-next'));
  const required = () =>
    allText(form).split('This field is required').length - 1;
  const toggle = () => press(byTestId(form, 'order-form-rm-arrived'));

  // Off: optional, plain Create order.
  expect(allText(byTestId(form, 'order-form-submit'))).toBe('Create order');
  await toggle();
  expect(allText(byTestId(form, 'order-form-submit'))).toBe(
    'Create order & add job card',
  );
  await press(byTestId(form, 'order-form-submit'));
  expect(required()).toBe(5);
  // Switching off drops the errors again.
  await toggle();
  expect(required()).toBe(0);
  await toggle();

  await press(byLabel(form, 'Bought out'));
  await typeInto(byTestId(form, 'order-form-rm-part-number'), 'RM-77');
  await typeInto(byLabel(form, 'Raw material size'), '25mm dia');
  await typeInto(byLabel(form, 'Heat number'), 'HT-1');
  await typeInto(byLabel(form, 'Raw material grade'), 'EN8');
  await press(byTestId(form, 'order-form-submit'));

  const created = Object.values(h.store.getState().orders.entities).find(
    o => o?.customerName === 'Zenith Tools',
  );
  expect(created).toMatchObject({
    materialSource: 'bought_out',
    rawMaterialGrade: 'EN8',
  });
  // Its job card exists; like every save, it ends on the orders list.
  expect((await jobCardsApi.list()).some(c => c.id === created!.id)).toBe(true);
  expect(h.currentRoute()).toBe('Orders');
  expect(hasTestId(h.root, 'order-form-screen')).toBe(false);
});

test('without arrived material, Create order adds no job card', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  const form = byTestId(h.root, 'order-form-screen');
  await typeInto(byTestId(form, 'order-form-customer'), 'Zenith Tools');
  await press(byTestId(form, 'order-form-design'));
  await press(byTestId(form, 'order-form-next'));
  await fillOrderDetails(form);
  await press(byTestId(form, 'order-form-next'));
  await press(byTestId(form, 'order-form-submit'));
  expect(h.currentRoute()).toBe('Orders');
  const created = Object.values(h.store.getState().orders.entities).find(
    o => o?.customerName === 'Zenith Tools',
  );
  expect((await jobCardsApi.list()).some(c => c.id === created!.id)).toBe(
    false,
  );
});

test('a pill says there are more fields below until the end', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  const form = byTestId(h.root, 'order-form-screen');
  const scroll = () => byTestId(form, 'order-form-scroll');
  const more = () => hasTestId(form, 'order-form-scroll-more');
  const act = async (fn: () => void) => {
    await ReactTestRenderer.act(async () => fn());
  };
  // Everything fits: no pill.
  await act(() => {
    scroll().props.onLayout({ nativeEvent: { layout: { height: 500 } } });
    scroll().props.onContentSizeChange(800, 400);
  });
  expect(more()).toBe(false);
  // Taller than the window: the pill shows until the end is reached.
  await act(() => scroll().props.onContentSizeChange(800, 1200));
  expect(more()).toBe(true);
  expect(allText(byTestId(form, 'order-form-scroll-more'))).toBe(
    'Scroll for more fields',
  );
  await act(() =>
    scroll().props.onScroll({ nativeEvent: { contentOffset: { y: 700 } } }),
  );
  expect(more()).toBe(false);
});

test('edit from the list returns to the list; from details, to details', async () => {
  // From the list: "Back to orders", and Save returns there.
  let h = await renderAdmin('Orders');
  await press(byLabel(h.root, 'Edit order WO #1042'));
  let form = byTestId(h.root, 'order-form-screen');
  expect(allText(byTestId(form, 'order-form-back-to-list'))).toBe(
    'Back to orders',
  );
  await press(byTestId(form, 'order-step-3'));
  await press(byTestId(form, 'order-form-submit'));
  expect(h.currentRoute()).toBe('Orders');

  // From details: "Back to order", and both Back and Save return there.
  h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  const editFromDetails = async () => {
    await press(
      byTestId(byTestId(h.root, 'order-details-screen'), 'edit-order'),
    );
    return byTestId(h.root, 'order-form-screen');
  };
  form = await editFromDetails();
  expect(allText(byTestId(form, 'order-form-back-to-list'))).toBe(
    'Back to order',
  );
  await press(byTestId(form, 'order-form-back-to-list'));
  expect(h.currentRoute()).toBe('OrderDetails');
  form = await editFromDetails();
  await press(byTestId(form, 'order-step-3'));
  await press(byTestId(form, 'order-form-submit'));
  expect(h.currentRoute()).toBe('OrderDetails');
});

test('saving an edit with a bad earlier step opens that step', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderForm', { orderId: '1040' });
  const form = byTestId(h.root, 'order-form-screen');
  await press(byTestId(form, 'order-step-2'));
  // Clear the delivery date from its calendar.
  await press(byTestId(form, 'order-form-delivery'));
  await press(byText(byTestId(form, 'order-form-delivery-calendar'), 'Clear'));
  expect(allText(byTestId(form, 'order-form-delivery'))).toBe('DD/MM/YYYY');
  // Going back never checks; jumping straight to the end skips step 2.
  await press(byTestId(form, 'order-step-1'));
  await press(byTestId(form, 'order-step-3'));
  await press(byTestId(form, 'order-form-submit'));
  expect(hasTestId(form, 'order-form-step-2')).toBe(true);
  expect(allText(form)).toContain('This field is required');
  expect(h.currentRoute()).toBe('OrderForm');
});

test('unknown order shows not found on details and form', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '9999' });
  expect(allText(h.root)).toContain('This order no longer exists.');
  await h.navigate('OrderForm', { orderId: '9999' });
  expect(allText(byTestId(h.root, 'order-form-screen'))).toContain(
    'This order no longer exists.',
  );
});

test('phone: stat tiles, cards and step footer', async () => {
  mockWidth = 390;
  const h = await renderAdmin('Orders');
  expect(allText(h.root)).toContain('Open orders');
  // 10 open (the two new example orders included); 5 of them high.
  expect(allText(byTestId(h.root, 'stat-open'))).toContain('10');
  expect(allText(byTestId(h.root, 'stat-high'))).toContain('5');
  expect(hasTestId(h.root, 'order-card-1042')).toBe(true);
  await press(byTestId(h.root, 'order-card-1042'));
  expect(allText(byTestId(h.root, 'order-details-screen'))).toContain(
    'Order details',
  );
  await h.navigate('OrderForm');
  const form = byTestId(h.root, 'order-form-screen');
  expect(allText(form)).toContain('Step 1 of 3 · Customer');
  await typeInto(byTestId(form, 'order-form-customer'), 'Zenith Tools');
  await press(byTestId(form, 'order-form-design'));
  await press(byTestId(form, 'order-form-next'));
  expect(allText(form)).toContain('Step 2 of 3 · Order details');
  await press(byLabel(form, 'Back'));
  expect(allText(form)).toContain('Step 1 of 3 · Customer');
});

test('order helpers', () => {
  const [first] = MOCK_ORDERS;
  expect(
    orderTitle({
      partName: '',
      jobName: '',
      description: 'Line one\nline two',
    }),
  ).toBe('Line one');
  expect(materialLine({ ...first, material: '', quantity: 0 })).toBe('EN8');
  const undated = { ...first, id: '1', dueDate: '', priority: 'high' as const };
  expect(compareOrders(first, undated)).toBeLessThan(0);
  expect(compareOrders(undated, first)).toBeGreaterThan(0);
  expect(compareOrders(undated, { ...undated, id: '2' })).toBeGreaterThan(0);
  const values = orderToFormValues(first);
  expect(validateOrderForm({ ...values, designFile: null })).toEqual({
    designFile: 'This field is required',
  });
  const bad = { ...values, customerEmail: 'x', dcDate: '99/99/9999' };
  expect(validateOrderForm(bad)).toEqual({
    customerEmail: 'Enter a valid email address',
    dcDate: 'Use DD/MM/YYYY',
  });
  expect(validateOrderForm({ ...values, customerName: ' ' })).toEqual({
    customerName: 'This field is required',
  });
  expect(hasStepErrors(1, bad)).toBe(true);
  expect(hasStepErrors(3, bad)).toBe(false);
  expect(firstStepWithErrors(bad)).toBe(1);
  expect(firstStepWithErrors({ ...bad, customerEmail: '' })).toBe(2);
  expect(firstStepWithErrors(values)).toBe(3);
  const input = formValuesToOrderInput({
    ...orderToFormValues(),
    description: 'New part',
    priority: '',
  });
  expect(input).toMatchObject({
    priority: 'low',
    quantity: 0,
    dueDate: '',
    partName: 'New part',
    documents: [],
  });
});

describe('Orders list actions', () => {
  test('edit opens the order form for that order', async () => {
    const h = await renderAdmin('Orders');
    await press(byLabel(h.root, 'Edit order WO #1042'));
    expect(h.currentRoute()).toBe('OrderForm');
  });

  test('the job card button opens the job card, or Create flow', async () => {
    const h = await renderAdmin('Orders');
    // 1042 has a route card: open its job card.
    await press(byLabel(h.root, 'Open job card for WO #1042'));
    expect(h.currentRoute()).toBe('JobCardDetails');

    // 1036 has no route card yet: straight to Create flow.
    await h.navigate('Orders');
    await press(byLabel(h.root, 'Create job card for WO #1036'));
    expect(h.currentRoute()).toBe('JobCardFlow');
    expect(allText(h.root)).toContain('Create flow');
  });

  test('a new order shows the job card button once it has one', async () => {
    const h = await renderAdmin('Orders');
    // Created without the raw material: no job card, so no button.
    await press(byTestId(h.root, 'create-order'));
    await typeInto(byTestId(h.root, 'order-form-customer'), 'Zenith Tools');
    await press(byTestId(h.root, 'order-form-design'));
    await press(byTestId(h.root, 'order-form-next'));
    await fillOrderDetails(h.root);
    await press(byTestId(h.root, 'order-form-next'));
    await press(byTestId(h.root, 'order-form-submit'));
    await typeInto(
      byLabel(h.root, 'Search by WO #, part or customer'),
      'WO #1045',
    );
    expect(allText(byTestId(h.root, 'orders-table'))).toContain('WO #1045');
    expect(hasTestId(h.root, 'job-card-1045')).toBe(false);
  });
});

test('search finds an order by its work ID in any common form', async () => {
  const { root } = await renderAdmin('Orders');
  const search = byLabel(root, 'Search by WO #, part or customer');
  for (const query of ['1042', 'WO #1042', 'wo1042', 'WO-1042']) {
    await typeInto(search, query);
    const text = allText(byTestId(root, 'orders-table'));
    expect(text).toContain('Showing 1 of 1');
    expect(text).toContain('WO #1042');
  }
});
