import { Linking } from 'react-native';
import {
  allText,
  byLabel,
  byTestId,
  byText,
  hasTestId,
  press,
  renderAdmin,
  typeInto,
} from '../../../shared/testing/testUtils';
import { validateCustomer } from '../components/CustomerFormModal';
import { formatAddress } from '../utils';

let mockWidth = 1280;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 900, scale: 1, fontScale: 1 }),
}));

beforeEach(() => {
  mockWidth = 1280;
});
afterEach(() => jest.restoreAllMocks());

test('desktop list shows projects, money and address', async () => {
  const { root } = await renderAdmin('Customers');
  const text = allText(root);
  expect(text).toContain(
    'Every customer account working with ABC Engineering Pvt Ltd.',
  );
  expect(text).toContain('12 active');
  expect(text).toContain('27 completed');
  expect(text).toContain('₹18,42,000');
  expect(text).toContain('12 Industrial Estate Road, Chennai, Tamil Nadu');
  expect(text).toContain('Not added yet');
  expect(text).toContain('Showing 5 of 5 customers');
});

test('search filters by name or city', async () => {
  const { root } = await renderAdmin('Customers');
  await typeInto(byLabel(root, 'Search customers'), 'bengaluru');
  expect(allText(root)).toContain('Nova Fabrication');
  expect(allText(root)).not.toContain('Acme Metalworks');
});

test('adds a customer with validation', async () => {
  const { root, store } = await renderAdmin('Customers');
  await press(byTestId(root, 'add-customer'));
  await press(byTestId(root, 'customer-form-submit'));
  expect(allText(root).split('This field is required').length - 1).toBe(3);
  await typeInto(byTestId(root, 'customer-form-name'), 'Kaveri Tools');
  await typeInto(byTestId(root, 'customer-form-contact'), 'Lakshmi Raman');
  await typeInto(byTestId(root, 'customer-form-mobile'), '+91 98400 12345');
  await typeInto(byTestId(root, 'customer-form-gst'), 'bad');
  await press(byTestId(root, 'customer-form-submit'));
  expect(allText(root)).toContain('GST numbers are 15 letters and digits');
  await typeInto(byTestId(root, 'customer-form-gst'), '33abcde1234f1z5');
  await press(byTestId(root, 'customer-form-submit'));
  const created = Object.values(store.getState().customers.entities).find(
    c => c.name === 'Kaveri Tools',
  );
  expect(created).toMatchObject({
    gstNumber: '33ABCDE1234F1Z5',
    state: 'Tamil Nadu',
    currentProjects: 0,
  });
});

test('edits and deletes from the list', async () => {
  const { root, store } = await renderAdmin('Customers');
  await press(byLabel(root, 'Edit Acme Metalworks'));
  expect(allText(root)).toContain("Update Acme Metalworks's account details.");
  await typeInto(byTestId(root, 'customer-form-contact'), 'R. Kumar');
  await press(byTestId(root, 'customer-form-submit'));
  expect(store.getState().customers.entities['CUS-1'].contactPerson).toBe(
    'R. Kumar',
  );

  await press(byLabel(root, 'Delete Silverline Industries'));
  expect(allText(root)).toContain(
    'and their order history from ABC Engineering Pvt Ltd',
  );
  await press(byText(root, 'Delete customer'));
  expect(store.getState().customers.entities['CUS-4']).toBeUndefined();
});

test('details screen: account, contact, notes, message and delete', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const h = await renderAdmin('Customers');
  await h.navigate('CustomerDetails', { customerId: 'CUS-1' });
  const screen = byTestId(h.root, 'customer-details-screen');
  const text = allText(screen);
  expect(text).toContain('Business customer');
  expect(text).toContain('Customer since Jan 12, 2025');
  expect(text).toContain('Rajesh Kumar · Contact person');
  expect(text).toContain('33AAAAA0000A1Z5');
  expect(text).toContain('Long-standing bracket supplier account.');
  expect(text).toContain('New order placed — Job A');
  await press(byText(screen, 'Message'));
  expect(openURL).toHaveBeenCalledWith('mailto:accounts@acmemetalworks.com');
  await press(byTestId(screen, 'edit-customer'));
  expect(allText(screen)).toContain('Edit customer');
  await press(byText(screen, 'Cancel'));
  await press(byTestId(screen, 'delete-customer'));
  await press(byText(screen, 'Delete customer'));
  expect(h.currentRoute()).toBe('Customers');
});

test('message falls back to SMS without an email', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const h = await renderAdmin('Customers');
  await h.navigate('CustomerDetails', { customerId: 'CUS-5' });
  await press(byText(byTestId(h.root, 'customer-details-screen'), 'Message'));
  expect(openURL).toHaveBeenCalledWith('sms:+919444011223');
});

test('unknown customer shows not found', async () => {
  const h = await renderAdmin('Customers');
  await h.navigate('CustomerDetails', { customerId: 'CUS-404' });
  expect(allText(h.root)).toContain('This customer no longer exists.');
});

test('phone: overview donut, compact rows and full-screen details', async () => {
  mockWidth = 390;
  const h = await renderAdmin('Customers');
  expect(hasTestId(h.root, 'customer-overview')).toBe(true);
  expect(allText(h.root)).toContain('12 active · 27 done');
  await press(byTestId(h.root, 'customer-row-CUS-2'));
  expect(h.currentRoute()).toBe('CustomerDetails');
  const text = allText(byTestId(h.root, 'customer-details-screen'));
  expect(text).toContain('Contact person');
  expect(text).toContain('Meera Nair');
});

test('validator and address helpers', () => {
  const base = {
    type: 'business' as const,
    name: 'A',
    contactPerson: 'B',
    mobile: '9876543210',
    email: 'bad',
    gstNumber: '',
    address: '',
    city: '',
    state: 'Kerala',
    notes: '',
  };
  expect(validateCustomer(base)).toEqual({
    email: 'Enter a valid email address',
  });
  expect(validateCustomer({ ...base, email: '', mobile: '12' })).toEqual({
    mobile: 'Enter a valid phone number',
  });
  expect(formatAddress({ address: '', city: 'Kochi', state: 'Kerala' })).toBe(
    'Kochi, Kerala',
  );
});

test('details screen lists the customer’s orders and shared quotes', async () => {
  const h = await renderAdmin('Customers');
  await h.navigate('CustomerDetails', { customerId: 'CUS-1' });

  const orders = allText(byTestId(h.root, 'customer-orders'));
  expect(orders).toContain('WO #1042');
  expect(orders).toContain('Bracket — Job A');
  // Other customers' orders stay out.
  expect(orders).not.toContain('WO #1041');

  const quotes = allText(byTestId(h.root, 'customer-quotes'));
  expect(quotes).toContain('QT-2026-0040');
  expect(quotes).toContain('Accepted');
  expect(quotes).not.toContain('QT-2026-0042');

  await press(byText(byTestId(h.root, 'customer-quotes'), 'QT-2026-0040'));
  expect(h.currentRoute()).toBe('QuoteDetails');
});
