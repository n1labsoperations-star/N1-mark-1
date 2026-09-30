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

test('stats and table reflect the machines', async () => {
  const { root } = await renderAdmin('Machines');
  expect(allText(byTestId(root, 'stat-total'))).toContain('10');
  expect(allText(byTestId(root, 'stat-running'))).toContain('5');
  expect(allText(byTestId(root, 'stat-idle'))).toContain('3');
  expect(allText(byTestId(root, 'stat-maintenance'))).toContain(
    'Under maintenance',
  );
  const text = allText(byTestId(root, 'machines-table'));
  expect(text).toContain('WO #1036 · Coupling — Job G');
  expect(text).toContain('Divya Ramesh');
  expect(text).toContain('CNC Lathe');
  expect(text).toContain('Kirloskar Turnmaster');
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
  expect(allText(byTestId(root, 'stat-total'))).toContain('11');
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
