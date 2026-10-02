import ReactTestRenderer from 'react-test-renderer';
import {
  allText,
  byLabel,
  byTestId,
  byText,
  choose,
  hasTestId,
  press,
  renderAppAs,
  typeInto,
} from '../../../shared/testing/testUtils';
import { jobCardsApi } from '../../jobCards/api/jobCardsApi';
import { MOCK_ORDERS } from '../../orders/api/mockData';
import { ordersApi } from '../../orders/api/ordersApi';
import { isRawMaterialMissing, parseJobCode } from '../utils';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
}));

let app: ReactTestRenderer.ReactTestRenderer | undefined;

// Only one linked NavigationContainer may be mounted at a time.
afterEach(async () => {
  await ReactTestRenderer.act(() => app?.unmount());
  app = undefined;
});

async function secondAdmin() {
  app = await renderAppAs('secondadmin@n1.com', 'SecondAdmin@123');
  return app.root;
}

/** Import Job → Enter code manually → type the code → Import Job. */
async function importCode(
  root: ReactTestRenderer.ReactTestInstance,
  code: string,
) {
  await press(byTestId(root, 'import-job'));
  expect(allText(root)).toContain('Align the QR code within the frame');
  await press(byText(root, 'Enter code manually'));
  await typeInto(byTestId(root, 'job-code-input'), code);
  await press(byTestId(root, 'job-code-submit'));
}

describe('utils', () => {
  test('parseJobCode reads the work order number from any code format', () => {
    expect(parseJobCode('WO-01042')).toBe('1042');
    expect(parseJobCode('wo #1042')).toBe('1042');
    expect(parseJobCode(' 1042 ')).toBe('1042');
    expect(parseJobCode('WO-')).toBe('');
  });

  test('isRawMaterialMissing flags any blank raw material detail', () => {
    const [order] = MOCK_ORDERS;
    expect(isRawMaterialMissing(order)).toBe(false);
    expect(isRawMaterialMissing({ ...order, supplier: '' })).toBe(true);
    expect(isRawMaterialMissing({ ...order, heatNumber: ' ' })).toBe(true);
  });
});

test("My Jobs lists the user's jobs with counts and search", async () => {
  const root = await secondAdmin();

  const text = allText(root);
  expect(text).toContain('My Jobs');
  expect(text).toContain('4 active · 5 total');
  expect(hasTestId(root, 'job-card-1042')).toBe(true);
  // Job cards that were never imported stay off the list.
  expect(hasTestId(root, 'job-card-1036')).toBe(false);

  await press(byLabel(root, 'Search jobs'));
  await typeInto(byTestId(root, 'my-jobs-search'), 'Housing');
  await ReactTestRenderer.act(
    () => new Promise(resolve => setTimeout(resolve, 400)),
  );
  expect(hasTestId(root, 'job-card-1034')).toBe(true);
  expect(hasTestId(root, 'job-card-1042')).toBe(false);

  await press(byLabel(root, 'Close search'));
  expect(hasTestId(root, 'job-card-1042')).toBe(true);
});

test('job codes that are blank or unknown show an error', async () => {
  const root = await secondAdmin();
  await importCode(root, '');
  expect(allText(root)).toContain('This field is required');

  await typeInto(byTestId(root, 'job-code-input'), 'WO-9999');
  await press(byTestId(root, 'job-code-submit'));
  expect(allText(root)).toContain('No work order found for WO-9999');
});

test('order → raw material modal → job added to My Jobs → job card', async () => {
  const root = await secondAdmin();
  await importCode(root, 'WO-01036');

  // Order screen.
  let text = allText(root);
  expect(text).toContain('WO #1036 · Coupling — Job G');
  expect(text).toContain('Bright Steel Co.');
  expect(text).toContain('Additional details');
  await press(byTestId(root, 'create-job-card'));

  // Raw Material Details: known values kept, every field required.
  expect(allText(root)).toContain('A few details are missing');
  expect(byTestId(root, 'raw-material-heatNumber').props.value).toBe(
    'HT-99207',
  );
  await typeInto(byTestId(root, 'raw-material-heatNumber'), ' ');
  await press(byTestId(root, 'raw-material-submit'));
  expect(allText(root).split('This field is required').length - 1).toBe(2);
  await typeInto(byTestId(root, 'raw-material-heatNumber'), 'HT-55555');
  await choose(root, 'raw-material-supplier', 'Hindalco Metals');
  await press(byTestId(root, 'raw-material-submit'));

  // Straight to the new job's job card.
  text = allText(root);
  expect(text).toContain('Job card');
  expect(text).toContain('WO #1036 · Bright Steel Co.');
  expect(text).toContain('Route card & progress');
  expect(text).not.toContain('Raw Material Details');
  const order = (await ordersApi.list()).find(o => o.id === '1036');
  expect(order).toMatchObject({
    supplier: 'Hindalco Metals',
    heatNumber: 'HT-55555',
  });

  // Back lands on My Jobs, with the job added at the top.
  await press(byLabel(root, 'Back'));
  text = allText(root);
  expect(text).toContain('5 active · 6 total');
  expect(text.indexOf('WO #1036')).toBeLessThan(text.indexOf('WO #1042'));
});

test('closing the raw material modal keeps the order open', async () => {
  const root = await secondAdmin();
  await importCode(root, '1039');
  await press(byTestId(root, 'create-job-card'));

  expect(allText(root)).toContain('Raw Material Details');
  await press(byLabel(root, 'Close'));

  expect(allText(root)).not.toContain('Raw Material Details');
  expect(allText(root)).toContain('Create Job Card');
});

test('a job already on My Jobs opens its job card from the order', async () => {
  const root = await secondAdmin();
  await importCode(root, '1042');

  expect(allText(root)).toContain('View Job Card');
  await press(byTestId(root, 'create-job-card'));

  expect(allText(root)).toContain('Route card & progress');
  await press(byText(root, 'Edit'));
  expect(allText(root)).toContain('Edit flow');
});

test('an order without a job card gets one created', async () => {
  // A new work order; it gets the next number, 1043.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, status, statusHistory, createdAt, ...input } = MOCK_ORDERS[0];
  app = await renderAppAs('secondadmin@n1.com', 'SecondAdmin@123', () =>
    ordersApi.create(input),
  );
  const root = app.root;

  await importCode(root, 'WO-1043');
  await press(byTestId(root, 'create-job-card'));
  // Every detail is already there, so the modal asks to confirm them.
  expect(allText(root)).toContain('Check the raw material details');
  await press(byTestId(root, 'raw-material-submit'));

  expect(allText(root)).toContain('Route card & progress');
  const created = (await jobCardsApi.list()).find(c => c.id === '1043');
  expect(created).toMatchObject({ status: 'not_started', operations: [] });
});
