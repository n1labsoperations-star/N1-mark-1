import {
  allText,
  byTestId,
  byText,
  press,
  renderAdmin,
} from '../../../shared/testing/testUtils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});

test('stats, distribution and priority jobs come from the other modules', async () => {
  const { root } = await renderAdmin('Dashboard');
  expect(allText(root)).toContain('Overview for ABC Engineering Pvt Ltd.');
  expect(allText(byTestId(root, 'stat-newOrders'))).toContain('3');
  const dist = allText(byTestId(root, 'distribution-card'));
  expect(dist).toContain('30 active orders');
  [
    'Acme Metalworks',
    '40%',
    'Bright Steel Co.',
    '27%',
    'Nova Fabrication',
    '17%',
    'Silverline Industries',
    '10%',
  ].forEach(t => expect(dist).toContain(t));
  // Only the top four customers are listed.
  expect(dist).not.toContain('Meridian Components');
  const jobs = allText(byTestId(root, 'priority-jobs-card'));
  expect(jobs).toContain('View all (10)');
  expect(jobs.indexOf('Job A')).toBeLessThan(jobs.indexOf('Job B'));
  expect(jobs).toContain('HI');
  expect(jobs).toContain('QC pending');
});

test('links go to customers and orders', async () => {
  const h = await renderAdmin('Dashboard');
  await press(byText(h.root, 'Bright Steel Co.'));
  expect(h.currentRoute()).toBe('CustomerDetails');
  await h.navigate('Dashboard');
  await press(byTestId(h.root, 'view-more-customers'));
  expect(h.currentRoute()).toBe('Customers');
  await h.navigate('Dashboard');
  await press(byTestId(h.root, 'priority-job-1039'));
  expect(h.currentRoute()).toBe('OrderDetails');
  await h.navigate('Dashboard');
  await press(byTestId(h.root, 'view-all-jobs'));
  expect(h.currentRoute()).toBe('Orders');
});

test('phone layout lists order counts per customer', async () => {
  mockWidth = 390;
  const { root } = await renderAdmin('Dashboard');
  const dist = allText(byTestId(root, 'distribution-card'));
  expect(dist).toContain('30 active');
  expect(dist).toContain('12 orders');
  expect(dist).toContain('Billed: ₹18,42,000');
});
