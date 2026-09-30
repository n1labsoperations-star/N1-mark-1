import {
  allText,
  byLabel,
  byTestId,
  flush,
  press,
  renderAdmin,
  typeInto,
} from '../../../../shared/testing/testUtils';
import { ADMIN_NAV_ITEMS, ROUTE_SECTION, isSectionRoot } from '../navItems';
import { profileApi } from '../../../../features/profile/api/profileApi';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(async () => {
  // Let Redux Toolkit's batched notifications land inside act().
  await flush();
  jest.restoreAllMocks();
});

test('desktop sidebar navigates between modules and highlights the active one', async () => {
  const h = await renderAdmin('Dashboard');
  expect(allText(h.root)).toContain('ABC Engineering Pvt Ltd');
  for (const item of ADMIN_NAV_ITEMS) {
    await press(byLabel(h.root, item.label));
    expect(h.currentRoute()).toBe(item.key);
    const { props } = byLabel(h.root, item.label);
    expect(props['aria-selected'] ?? props.accessibilityState?.selected).toBe(
      true,
    );
  }
});

test('sidebar search filters the menu and the sidebar collapses', async () => {
  const h = await renderAdmin('Dashboard');
  await press(byLabel(h.root, 'Collapse sidebar'));
  expect(
    h.root.findAll(n => n.props.accessibilityLabel === 'Search here…'),
  ).toHaveLength(0);
  await press(byLabel(h.root, 'Expand sidebar'));
  await typeInto(byLabel(h.root, 'Search here…'), 'bill');
  const menu = h.root.findAll(
    n => typeof n.type === 'string' && n.props.accessibilityRole === 'menuitem',
  );
  expect(menu.map(n => n.props.accessibilityLabel)).toEqual(['Billing']);
});

test('profile opens from the top bar; module switch resets history', async () => {
  const h = await renderAdmin('Orders');
  await h.navigate('OrderDetails', { orderId: '1042' });
  await press(byLabel(h.root, 'Users'));
  expect(h.currentRoute()).toBe('Users');
  const [topBarProfile] = h.root.findAll(
    n =>
      typeof n.type === 'string' &&
      n.props.accessibilityLabel === 'Open my profile',
  );
  await press(topBarProfile);
  expect(h.currentRoute()).toBe('MyProfile');
});

test('phone: menu bar on module screens, drawer navigation', async () => {
  mockWidth = 390;
  const h = await renderAdmin('Dashboard');
  expect(allText(h.root)).toContain('ABC Engineering');
  await press(byLabel(h.root, 'Open menu'));
  await press(byLabel(h.root, 'Machines'));
  expect(h.currentRoute()).toBe('Machines');
  await press(byLabel(h.root, 'Open menu'));
  const [, footer] = h.root.findAll(
    n =>
      typeof n.type === 'string' &&
      n.props.accessibilityLabel === 'Open my profile',
  );
  await press(footer);
  expect(h.currentRoute()).toBe('MyProfile');
  // Detail screens draw their own back header instead of the menu bar.
  expect(
    h.root.findAll(n => n.props.accessibilityLabel === 'Open menu'),
  ).toHaveLength(0);
});

test('shows a retry when the session fails to load', async () => {
  jest
    .spyOn(profileApi, 'fetchSession')
    .mockRejectedValueOnce(new Error('Network down'));
  const h = await renderAdmin('Dashboard');
  expect(allText(h.root)).toContain('Network down');
  await press(byLabel(h.root, 'Try again'));
  expect(allText(byTestId(h.root, 'dashboard-screen'))).toContain('Dashboard');
});

test('route → section map covers every route', () => {
  expect(ROUTE_SECTION.InvoiceEdit).toBe('Billing');
  expect(ROUTE_SECTION.MyProfile).toBeUndefined();
  expect(isSectionRoot('Billing')).toBe(true);
  expect(isSectionRoot('QuoteForm')).toBe(false);
});
