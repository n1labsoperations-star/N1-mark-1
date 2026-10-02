import ReactTestRenderer, { type ReactTestInstance } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '../../../app/navigation/RootNavigator';
import { createStore } from '../../../app/store';
import { N1ThemeProvider } from '../../../shared/components';
import {
  allText,
  byTestId,
  byText,
  choose,
  press,
  render,
  renderAdmin,
  resetMockApis,
  typeInto,
} from '../../../shared/testing/testUtils';
import { INDUSTRY_OPTIONS } from '../../auth/constants';

// The organization name sits in the wide top bar.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 1280, height: 900, scale: 1, fontScale: 1 }),
}));

let app: ReactTestRenderer.ReactTestRenderer | undefined;
afterEach(async () => {
  await ReactTestRenderer.act(() => app?.unmount());
  app = undefined;
});

const input = (root: ReactTestInstance, placeholder: string) =>
  root.find(
    n => typeof n.type === 'string' && n.props.placeholder === placeholder,
  );

test('the organization name opens the organization details', async () => {
  const h = await renderAdmin('Overview');
  await press(byTestId(h.root, 'open-organization'));

  expect(h.currentRoute()).toBe('Organization');
  const text = allText(byTestId(h.root, 'organization-screen'));
  for (const value of [
    'Organization details',
    'ABC Engineering Pvt Ltd',
    'ABC001',
    'Metal Manufacturing',
    'admin@abcengineering.com',
    '+91 44 4000 1000',
    '33ABCDE1234F1Z5',
    'Sep 12, 2026',
  ]) {
    expect(text).toContain(value);
  }
});

test('details come from Create organization', async () => {
  resetMockApis();
  app = await render(
    <Provider store={createStore()}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 1280, height: 900 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <N1ThemeProvider>
          <RootNavigator />
        </N1ThemeProvider>
      </SafeAreaProvider>
    </Provider>,
  );
  const { root } = app;

  // Login → Create organization.
  const [link] = root.findAll(
    n =>
      typeof n.type === 'string' &&
      n.props.accessibilityRole === 'link' &&
      allText(n) === 'Create organization',
  );
  await press(link);

  await typeInto(
    input(root, 'ABC Engineering Pvt Ltd'),
    'Nova Precision Pvt Ltd',
  );
  await ReactTestRenderer.act(() => {
    root
      .find(n => n.props.options === INDUSTRY_OPTIONS)
      .props.onChange('automotive');
  });
  await typeInto(input(root, 'owner@abcengineering.com'), 'hello@nova.in');
  await typeInto(input(root, '+91 98765 43210'), '+91 90000 11111');
  await typeInto(input(root, 'e.g. 33ABCDE1234F1Z5'), '29aaaaa0000a1z5');
  await typeInto(input(root, 'Create a password'), 'secret123');
  await typeInto(input(root, 'Re-enter password'), 'secret123');
  const [submit] = root.findAll(
    n =>
      typeof n.type === 'string' &&
      n.props.accessibilityRole === 'button' &&
      n.props.accessibilityLabel === 'Create organization',
  );
  await press(submit);

  // Signed in as the admin; the top bar shows the new organization.
  expect(allText(byTestId(root, 'open-organization'))).toBe(
    'Nova Precision Pvt Ltd',
  );
  await press(byTestId(root, 'open-organization'));

  const text = allText(byTestId(root, 'organization-screen'));
  for (const value of [
    'Nova Precision Pvt Ltd',
    'NOVAPR',
    'Automotive',
    'hello@nova.in',
    '+91 90000 11111',
    // Saved in capitals.
    '29AAAAA0000A1Z5',
  ]) {
    expect(text).toContain(value);
  }
});

describe('organization sections', () => {
  const openOrganization = async () => {
    const h = await renderAdmin('Overview');
    await press(byTestId(h.root, 'open-organization'));
    return h;
  };
  const org = (h: Awaited<ReturnType<typeof renderAdmin>>) =>
    h.store.getState().profile.organization!;

  test('shows all six sections', async () => {
    const h = await openOrganization();
    const text = allText(byTestId(h.root, 'organization-screen'));
    for (const value of [
      'General',
      'Business details',
      'Address',
      'GST & tax',
      'Invoice settings',
      'Document settings',
      'www.abcengineering.com',
      'Private Limited',
      'CIN U28910TN2018PTC123456',
      'Chennai',
      '600098',
      // Active rates only (28% is configured but inactive).
      '5%, 12%, 18%',
      'INV-2026-',
      'Net 30',
      'Thank you for your business.',
    ]) {
      expect(text).toContain(value);
    }
  });

  test('general: saves name, logo, phone, email and website', async () => {
    const h = await openOrganization();
    await press(byTestId(h.root, 'edit-organization-general'));
    expect(allText(h.root)).toContain('Edit general');

    await typeInto(
      byTestId(h.root, 'organization-form-name'),
      'ABC Precision Ltd',
    );
    await press(byTestId(h.root, 'organization-form-logo'));
    await typeInto(byTestId(h.root, 'organization-form-website'), 'abc.in');
    await press(byTestId(h.root, 'organization-form-submit'));

    expect(org(h)).toMatchObject({
      name: 'ABC Precision Ltd',
      shortName: 'ABC Precision',
      website: 'abc.in',
      logo: expect.objectContaining({ name: 'logo.png' }),
      // Untouched sections keep their values.
      city: 'Chennai',
    });
    expect(allText(byTestId(h.root, 'open-organization'))).toBe(
      'ABC Precision Ltd',
    );
  });

  test('general: name and a valid email and website are required', async () => {
    const h = await openOrganization();
    await press(byTestId(h.root, 'edit-organization-general'));
    await typeInto(byTestId(h.root, 'organization-form-name'), ' ');
    await typeInto(byTestId(h.root, 'organization-form-email'), 'nope');
    await typeInto(byTestId(h.root, 'organization-form-website'), 'not a site');
    await press(byTestId(h.root, 'organization-form-submit'));

    const text = allText(h.root);
    expect(text).toContain('This field is required');
    expect(text).toContain('Enter a valid email address');
    expect(text).toContain('Enter a valid website, e.g. www.company.com');
    expect(org(h).name).toBe('ABC Engineering Pvt Ltd');
  });

  test('business and address', async () => {
    const h = await openOrganization();
    await press(byTestId(h.root, 'edit-organization-business'));
    await choose(h.root, 'organization-form-businessType', 'LLP');
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(org(h).businessType).toBe('llp');

    await press(byTestId(h.root, 'edit-organization-address'));
    await typeInto(byTestId(h.root, 'organization-form-pinCode'), '123');
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(allText(h.root)).toContain('Enter a 6-digit PIN code');

    await typeInto(byTestId(h.root, 'organization-form-pinCode'), '560001');
    await typeInto(byTestId(h.root, 'organization-form-city'), 'Bengaluru');
    await choose(h.root, 'organization-form-state', 'Karnataka');
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(org(h)).toMatchObject({
      pinCode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
    });
  });

  const openGst = async () => {
    const h = await openOrganization();
    await press(byTestId(h.root, 'edit-organization-gst'));
    return h;
  };
  const settings = (h: Awaited<ReturnType<typeof renderAdmin>>) =>
    allText(byTestId(h.root, 'gst-settings'));

  test('GST settings: registration, default rate, rates and how it applies', async () => {
    const h = await openGst();
    const text = settings(h);
    for (const value of [
      'GST & Tax Settings',
      'Used to determine CGST/SGST or IGST on invoices.',
      'This rate will be selected automatically when creating invoices.',
      'Configured tax rates',
      'How GST is applied',
      'CGST 9% + SGST 9%',
      'IGST 18%',
    ]) {
      expect(text).toContain(value);
    }
    // 18% splits into 9 + 9, IGST 18; 28% is listed as inactive.
    const table = allText(byTestId(h.root, 'tax-rates-table'));
    expect(table).toContain('Inactive');
    expect(table).toContain('9%');
    expect(table).toContain('2.5%');
  });

  test('GST settings: the GSTIN fills in its state and must match it', async () => {
    const h = await openGst();
    await typeInto(byTestId(h.root, 'gst-settings-gstin'), '12345');
    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(settings(h)).toContain('Enter a valid 15-character GST number');

    // 29 = Karnataka.
    await typeInto(byTestId(h.root, 'gst-settings-gstin'), '29aaaaa0000a1z5');
    expect(allText(byTestId(h.root, 'gst-settings-state'))).toContain(
      'Karnataka',
    );
    await choose(h.root, 'gst-settings-state', 'Kerala');
    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(settings(h)).toContain('This doesn’t match the GSTIN’s state code');

    await choose(h.root, 'gst-settings-state', 'Karnataka');
    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(org(h)).toMatchObject({
      gstNumber: '29AAAAA0000A1Z5',
      gstState: 'Karnataka',
    });
    // The card still shows only the summary.
    const card = allText(byTestId(h.root, 'organization-gst'));
    expect(card).toContain('Karnataka');
    expect(card).not.toContain('CGST');
  });

  test('GST settings: No hides the GSTIN and rates and clears them on save', async () => {
    const h = await openGst();
    await press(byText(h.root, 'No'));
    expect(settings(h)).toContain('GST will not be applied to invoices.');
    expect(() => byTestId(h.root, 'gst-settings-gstin')).toThrow();
    expect(() => byTestId(h.root, 'tax-rates-table')).toThrow();
    await press(byTestId(h.root, 'gst-settings-submit'));

    expect(org(h)).toMatchObject({
      gstRegistered: false,
      gstNumber: '',
      gstState: '',
    });
  });

  test('add a tax rate: CGST / SGST / IGST are calculated', async () => {
    const h = await openGst();
    await press(byTestId(h.root, 'add-tax-rate'));
    await typeInto(byTestId(h.root, 'tax-rate-value'), '3');
    expect(byTestId(h.root, 'tax-rate-cgst').props.value).toBe('1.5');
    expect(byTestId(h.root, 'tax-rate-sgst').props.value).toBe('1.5');
    expect(byTestId(h.root, 'tax-rate-igst').props.value).toBe('3');

    // Duplicates and nonsense are refused.
    await typeInto(byTestId(h.root, 'tax-rate-value'), '18');
    await press(byTestId(h.root, 'tax-rate-submit'));
    expect(allText(h.root)).toContain('This rate is already configured');
    await typeInto(byTestId(h.root, 'tax-rate-value'), '150');
    await press(byTestId(h.root, 'tax-rate-submit'));
    expect(allText(h.root)).toContain('Enter a rate between 0 and 100');

    await typeInto(byTestId(h.root, 'tax-rate-value'), '3');
    await press(byTestId(h.root, 'tax-rate-submit'));
    // Back on the settings, then saved with the organization.
    await choose(h.root, 'gst-settings-default', '3%');
    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(org(h).defaultTaxRate).toBe(3);
    expect(org(h).taxRates.map(r => r.rate)).toEqual([3, 5, 12, 18, 28]);
    expect(allText(byTestId(h.root, 'organization-gst'))).toContain(
      '3%, 5%, 12%, 18%',
    );
  });

  test('edit a tax rate: switching off the default asks for a new one', async () => {
    const h = await openGst();
    await press(byTestId(h.root, 'edit-rate-18'));
    expect(allText(h.root)).toContain('Edit Tax Rate');
    await press(byTestId(h.root, 'tax-rate-active'));
    await press(byTestId(h.root, 'tax-rate-submit'));

    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(settings(h)).toContain('Pick the default GST rate');
    await choose(h.root, 'gst-settings-default', '12%');
    await press(byTestId(h.root, 'gst-settings-submit'));
    expect(org(h)).toMatchObject({ defaultTaxRate: 12 });
    expect(org(h).taxRates.find(r => r.rate === 18)?.active).toBe(false);
  });

  test('invoice and document settings', async () => {
    const h = await openOrganization();
    await press(byTestId(h.root, 'edit-organization-invoice'));
    await typeInto(
      byTestId(h.root, 'organization-form-invoiceStartNumber'),
      '0',
    );
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(allText(h.root)).toContain('Enter a whole number, 1 or more');

    await typeInto(
      byTestId(h.root, 'organization-form-invoiceStartNumber'),
      '250',
    );
    await choose(h.root, 'organization-form-paymentTerms', 'Net 45');
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(org(h)).toMatchObject({
      invoiceStartNumber: 250,
      paymentTerms: 'net-45',
    });

    await press(byTestId(h.root, 'edit-organization-documents'));
    await press(byTestId(h.root, 'organization-form-signature'));
    await press(byTestId(h.root, 'organization-form-submit'));
    expect(org(h).signature).toEqual(
      expect.objectContaining({ name: 'signature.png' }),
    );
  });
});
