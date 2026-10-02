import { COMMON_STRINGS, stateForGstin } from '../../shared/constants';
import type { FormErrors } from '../../shared/hooks';
import {
  formatRate,
  isBlank,
  isGstin,
  normalizeGstin,
} from '../../shared/utils';
import type { Organization, TaxRate } from './types';

export const GST_STRINGS = {
  title: 'GST & Tax Settings',
  subtitle: 'How GST is charged on your quotes and invoices.',
  registration: 'GST registration',
  registered: 'GST registered',
  yes: 'Yes',
  no: 'No',
  gstin: 'GSTIN',
  gstinPlaceholder: 'e.g. 33ABCDE1234F1Z5',
  state: 'State',
  statePlaceholder: 'Select state',
  stateHelp: 'Used to determine CGST/SGST or IGST on invoices.',
  notApplied: 'GST will not be applied to invoices.',
  defaultRate: 'Default GST rate',
  defaultRatePlaceholder: 'Select default rate',
  defaultRateHelp:
    'This rate will be selected automatically when creating invoices.',
  configured: 'Configured tax rates',
  columns: {
    rate: 'Tax rate',
    cgst: 'CGST',
    sgst: 'SGST',
    igst: 'IGST',
    status: 'Status',
    action: 'Action',
  },
  active: 'Active',
  inactive: 'Inactive',
  addRate: 'Add Tax Rate',
  editRate: 'Edit Tax Rate',
  editRateA11y: (rate: string) => `Edit ${rate} tax rate`,
  rateField: 'GST rate',
  ratePlaceholder: 'e.g. 18',
  rateActive: 'Active',
  rateActiveHelp: 'Inactive rates can’t be picked on new invoices.',
  calculated: 'Calculated automatically from the GST rate.',
  saveRate: 'Save Tax Rate',
  howTitle: 'How GST is applied',
  howIntro:
    'Chosen automatically on each invoice from your state and the customer’s state.',
  intra: 'Intra-state customer (same state)',
  inter: 'Inter-state customer (different state)',
  example: (rate: string) => `Example: GST ${rate}`,
  errors: {
    gstState: 'This doesn’t match the GSTIN’s state code',
    noActiveRate: 'Keep at least one active tax rate',
    defaultRate: 'Pick the default GST rate',
    rate: 'Enter a rate between 0 and 100, up to 2 decimals',
    duplicateRate: 'This rate is already configured',
  },
} as const;

const S = GST_STRINGS;

/** What the GST & Tax Settings modal edits. */
export type GstSettings = Pick<
  Organization,
  'gstRegistered' | 'gstNumber' | 'gstState' | 'taxRates' | 'defaultTaxRate'
>;

export const toGstSettings = (o: Organization): GstSettings => ({
  gstRegistered: o.gstRegistered,
  gstNumber: o.gstNumber,
  gstState: o.gstState,
  taxRates: o.taxRates,
  defaultTaxRate: o.defaultTaxRate,
});

/** Active rates, lowest first. */
export const activeTaxRates = (rates: readonly TaxRate[]) =>
  rates
    .filter(r => r.active)
    .map(r => r.rate)
    .sort((a, b) => a - b);

/** "5%, 12%, 18%" for the summary card. */
export const taxRatesSummary = (rates: readonly TaxRate[]) =>
  activeTaxRates(rates).map(formatRate).join(', ');

export function validateGstSettings(v: GstSettings): FormErrors<GstSettings> {
  const errors: FormErrors<GstSettings> = {};
  if (!v.gstRegistered) {
    return errors;
  }
  if (isBlank(v.gstNumber)) {
    errors.gstNumber = COMMON_STRINGS.required;
  } else if (!isGstin(v.gstNumber)) {
    errors.gstNumber = COMMON_STRINGS.invalidGstin;
  }
  if (isBlank(v.gstState)) {
    errors.gstState = COMMON_STRINGS.required;
  } else if (
    isGstin(v.gstNumber) &&
    stateForGstin(normalizeGstin(v.gstNumber)) !== v.gstState
  ) {
    errors.gstState = S.errors.gstState;
  }
  const active = activeTaxRates(v.taxRates);
  if (!active.length) {
    errors.taxRates = S.errors.noActiveRate;
  } else if (v.defaultTaxRate === null || !active.includes(v.defaultTaxRate)) {
    errors.defaultTaxRate = S.errors.defaultRate;
  }
  return errors;
}

/**
 * The settings as saved. Not registered: the GSTIN and its state are
 * cleared (the configured rates are kept for when GST is switched on again).
 */
export function gstSettingsChanges(v: GstSettings): GstSettings {
  const taxRates = [...v.taxRates].sort((a, b) => a.rate - b.rate);
  return v.gstRegistered
    ? {
        gstRegistered: true,
        gstNumber: normalizeGstin(v.gstNumber),
        gstState: v.gstState,
        taxRates,
        defaultTaxRate: v.defaultTaxRate,
      }
    : {
        gstRegistered: false,
        gstNumber: '',
        gstState: '',
        taxRates,
        defaultTaxRate: v.defaultTaxRate,
      };
}

const RATE_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

/** The error for a typed GST rate, if any. */
export function validateTaxRate(
  text: string,
  rates: readonly TaxRate[],
  editingId?: string,
): string | undefined {
  const value = text.trim();
  const rate = Number(value);
  if (!RATE_PATTERN.test(value) || rate > 100) {
    return S.errors.rate;
  }
  if (rates.some(r => r.rate === rate && r.id !== editingId)) {
    return S.errors.duplicateRate;
  }
  return undefined;
}

let rateCounter = 0;
export const newTaxRateId = () => {
  rateCounter += 1;
  return `rate-${Date.now()}-${rateCounter}`;
};
