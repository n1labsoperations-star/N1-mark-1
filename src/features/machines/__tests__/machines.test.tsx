import {
  allText,
  byLabel,
  byTestId,
  choose,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});

test('the totals sit in the pagination bar and the table lists machines', async () => {
  const { root } = await renderAdmin('Machines');
  const table = byTestId(root, 'machines-table');
  const text = allText(table);
  // Wide screens: no stat tiles; the totals are in the pagination summary.
  expect(hasTestId(root, 'machine-stats')).toBe(false);
  expect(text).toContain(
    'Showing 10 of 10 machines · 5 running · 3 idle · 2 under maintenance',
  );
  expect(text).toContain('WO #1036 · Coupling — Job G');
  expect(text).toContain('Divya Ramesh');
  expect(text).toContain('CNC Lathe');
  expect(text).toContain('Kirloskar Turnmaster');
  // Title and Add live in the toolbar; only the rows scroll.
  expect(text).toContain('Machines');
  expect(hasTestId(table, 'add-machine')).toBe(true);
  const scroll = byTestId(table, 'machines-table-scroll');
  expect(allText(scroll)).toContain('Turning Center 1');
  expect(allText(scroll)).not.toContain('Showing 10 of 10 machines');
});

test('search and the multi-select status filter narrow the list', async () => {
  const { root } = await renderAdmin('Machines');
  const panel = () => byTestId(root, 'machines-filter-panel');
  const showing = () =>
    allText(byTestId(root, 'machines-table')).match(/Showing \d+ of \d+/)?.[0];

  await typeInto(byLabel(root, 'Search by WO #, machine or code'), 'cnc mill');
  expect(showing()).toBe('Showing 2 of 2');
  await typeInto(byLabel(root, 'Search by WO #, machine or code'), '');

  await press(byTestId(root, 'machines-filter'));
  await press(byLabel(panel(), 'Idle'));
  await press(byLabel(panel(), 'Maintenance'));
  await press(byTestId(root, 'machines-filter-apply'));
  expect(showing()).toBe('Showing 5 of 5');
  expect(allText(root)).not.toContain('Turning Center 1');
  expect(byLabel(root, 'Filter (2)')).toBeTruthy();
});

test('adds a machine with required fields and a unique code', async () => {
  const { root, store } = await renderAdmin('Machines');
  await press(byTestId(root, 'add-machine'));
  await press(byTestId(root, 'machine-form-submit'));
  expect(allText(root).split('This field is required').length - 1).toBe(3);
  await typeInto(byTestId(root, 'machine-form-name'), 'Turning Center 3');
  await typeInto(byTestId(root, 'machine-form-code'), 'cnc-01');
  await typeInto(byTestId(root, 'machine-form-location'), 'Bay 1');
  await press(byTestId(root, 'machine-form-submit'));
  expect(allText(root)).toContain('Another machine already uses this code');
  await typeInto(byTestId(root, 'machine-form-code'), 'cnc-05');
  await press(byTestId(root, 'machine-form-submit'));
  const created = Object.values(store.getState().machines.entities).find(
    m => m.code === 'CNC-05',
  );
  expect(created).toMatchObject({
    name: 'Turning Center 3',
    status: 'running',
    currentWork: null,
  });
  // The total in the pagination bar counts the new machine (and it's running).
  expect(allText(byTestId(root, 'machines-table'))).toContain(
    'of 11 machines · 6 running',
  );
});

test('edits a machine status; its own code is allowed', async () => {
  const { root, store } = await renderAdmin('Machines');
  await press(byLabel(root, 'Edit Milling Center 1'));
  expect(allText(root)).toContain("Update Milling Center 1's details.");
  expect(byTestId(root, 'machine-form-code').props.value).toBe('CNC-03');
  await choose(root, 'machine-form-status', 'Idle');
  await press(byTestId(root, 'machine-form-submit'));
  expect(store.getState().machines.entities['MCH-3']).toMatchObject({
    code: 'CNC-03',
    status: 'idle',
  });
});

test('phone shows cards with current work and edit buttons', async () => {
  mockWidth = 390;
  const { root } = await renderAdmin('Machines');
  expect(hasTestId(root, 'machine-card-MCH-1')).toBe(true);
  expect(allText(byTestId(root, 'stat-maintenance'))).toContain('Maintenance');
  await press(byLabel(root, 'Edit Turning Center 1'));
  expect(allText(root)).toContain('Edit machine');
});

test('search finds the machine running a work order', async () => {
  const { root } = await renderAdmin('Machines');
  await typeInto(byLabel(root, 'Search by WO #, machine or code'), 'WO #1039');
  const text = allText(byTestId(root, 'machines-table'));
  expect(text).toContain('Showing 1 of 1');
  expect(text).toContain('Turning Center 2');
});
