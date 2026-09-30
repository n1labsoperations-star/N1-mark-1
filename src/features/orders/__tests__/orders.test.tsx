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
import { MOCK_ORDERS } from '../api/mockData';
import {
  formValuesToOrderInput,
  orderToFormValues,
  validateOrderStep1,
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

test('list is sorted by priority then due date', async () => {
  const { root } = await renderAdmin('Orders');
  const text = allText(byTestId(root, 'orders-table'));
  const order = [
    'WO #1042',
    'WO #1040',
    'WO #1037',
    'WO #1033',
    'WO #1039',
    'WO #1041',
    'WO #1036',
    'WO #1034',
    'WO #1038',
    'WO #1035',
  ];
  const positions = order.map(id => text.indexOf(id));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(text).toContain('MS Round Bar · 200 pcs');
  expect(allText(root)).toContain('Showing 10 of 10 orders');
});

test('filters by priority and status, and searches', async () => {
  const { root } = await renderAdmin('Orders');
  await choose(root, 'filter-priority', 'Low');
  expect(allText(byTestId(root, 'orders-table'))).toContain('WO #1038');
  expect(allText(byTestId(root, 'orders-table'))).not.toContain('WO #1042');
  await choose(root, 'filter-priority', 'All priorities');
  await choose(root, 'filter-order-status', 'QC pending');
  expect(allText(root)).toContain('Showing 3 of 3 orders');
  await choose(root, 'filter-order-status', 'All statuses');
  await typeInto(byLabel(root, 'Search orders'), 'coupling');
  expect(allText(root)).toContain('Showing 1 of 1 orders');
});

test('details show the full work order', async () => {
  const h = await renderAdmin('Orders');
  await press(byText(h.root, 'WO #1042'));
  const screen = byTestId(h.root, 'order-details-screen');
  const text = allText(screen);
  expect(text).toContain('WO #1042 · Bracket — Job A');
  expect(text).toContain('High priority');
  expect(text).toContain('02 Oct 2026');
  expect(text).toContain('PO-8842');
  expect(text).toContain('HT-99213');
  expect(text).toContain('PO-8842_project-docs.pdf');
  expect(text).toContain('Moved to CNC Turning');
  expect(text).toContain('Rework batch');
  await press(byText(screen, 'Acme Metalworks'));
  expect(h.currentRoute()).toBe('CustomerDetails');
});

test('route card opens Job Cards; print explains it is not wired yet', async () => {
  const alert = jest.fn();
  (globalThis as { alert?: unknown }).alert = alert;
  const os = Platform.OS;
  Platform.OS = 'web';
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  const screen = byTestId(h.root, 'order-details-screen');
  await press(byText(screen, 'Print drawing with QR'));
  expect(alert).toHaveBeenCalledWith(
    expect.stringContaining(
      'Print drawing with QR will work once the backend is connected.',
    ),
  );
  await press(byLabel(screen, 'Download PO-8842_project-docs.pdf'));
  expect(alert).toHaveBeenCalledTimes(2);
  Platform.OS = os;
  await press(byTestId(screen, 'view-route-card'));
  expect(h.currentRoute()).toBe('JobCards');
  expect(allText(h.root)).toContain('Job Cards are on the way');
});

test('creates an order over two steps', async () => {
  const h = await renderAdmin('Orders');
  await press(byTestId(h.root, 'create-order'));
  let form = byTestId(h.root, 'order-form-screen');
  expect(allText(form)).toContain('Create order · Step 1 of 2');

  await choose(form, 'order-form-customer', 'Nova Fabrication');
  expect(byTestId(form, 'order-form-email').props.value).toBe(
    'orders@novafab.co.in',
  );
  await typeInto(byTestId(form, 'order-form-quantity'), 'ten');
  await typeInto(byTestId(form, 'order-form-delivery'), '40/13/2026');
  await press(byTestId(form, 'order-form-next'));
  expect(allText(form)).toContain('Enter a number');
  expect(allText(form)).toContain('Use DD/MM/YYYY');

  await typeInto(byTestId(form, 'order-form-quantity'), '25');
  await typeInto(byTestId(form, 'order-form-delivery'), '20/10/2026');
  await typeInto(byTestId(form, 'order-form-description'), 'Spacer ring');
  await choose(form, 'order-form-priority', 'High');
  await press(byTestId(form, 'order-form-design'));
  expect(allText(form)).toContain('bracket-drawing.pdf');
  await press(byTestId(form, 'order-form-next'));

  form = byTestId(h.root, 'order-form-screen');
  expect(allText(form)).toContain('Create order · Step 2 of 2');
  await typeInto(byTestId(form, 'order-form-part-number'), 'PN-40001');
  await press(byTestId(form, 'order-form-submit'));

  expect(h.currentRoute()).toBe('Orders');
  const created = h.store.getState().orders.entities['1043'];
  expect(created).toMatchObject({
    customerName: 'Nova Fabrication',
    quantity: 25,
    dueDate: '2026-10-20',
    priority: 'high',
    status: 'new',
    partName: 'Spacer ring',
    partNumber: 'PN-40001',
  });
  expect(created.designFile?.name).toBe('bracket-drawing.pdf');
});

test('edits an existing order and keeps its names', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1040' });
  await press(byTestId(byTestId(h.root, 'order-details-screen'), 'edit-order'));
  const form = byTestId(h.root, 'order-form-screen');
  expect(allText(form)).toContain('Edit order · Step 1 of 2');
  expect(byTestId(form, 'order-form-quantity').props.value).toBe('120');
  await typeInto(byTestId(form, 'order-form-quantity'), '150');
  await press(byTestId(form, 'order-form-next'));
  await press(byText(form, 'Back'));
  expect(allText(form)).toContain('Step 1 of 2');
  await press(byTestId(form, 'order-form-next'));
  await press(byTestId(form, 'order-form-submit'));
  expect(h.store.getState().orders.entities['1040']).toMatchObject({
    quantity: 150,
    partName: 'Bracket',
    jobName: 'Job B',
  });
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
  expect(allText(byTestId(h.root, 'stat-open'))).toContain('8');
  expect(allText(byTestId(h.root, 'stat-high'))).toContain('4');
  expect(hasTestId(h.root, 'order-card-1042')).toBe(true);
  await press(byTestId(h.root, 'order-card-1042'));
  expect(allText(byTestId(h.root, 'order-details-screen'))).toContain(
    'Details',
  );
  await h.navigate('OrderForm');
  const form = byTestId(h.root, 'order-form-screen');
  await press(byTestId(form, 'order-form-next'));
  expect(allText(form)).toContain(
    'Part & material details — all fields are optional.',
  );
  await press(byLabel(form, 'Back'));
  expect(allText(form)).toContain('Create order · Step 1 of 2');
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
  expect(
    validateOrderStep1({ ...values, customerEmail: 'x', dcDate: '99/99/9999' }),
  ).toEqual({
    customerEmail: 'Enter a valid email address',
    dcDate: 'Use DD/MM/YYYY',
  });
  const input = formValuesToOrderInput(
    { ...orderToFormValues(), description: 'New part', priority: '' },
    '',
  );
  expect(input).toMatchObject({
    priority: 'medium',
    quantity: 0,
    dueDate: '',
    partName: 'New part',
    documents: [],
  });
});
