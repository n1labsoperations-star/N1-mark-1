import { useMemo } from 'react';
import { gstSupply, type GstSupply } from '../../../shared/utils';
import { useCustomers } from '../../customers';
import { useSession } from '../../profile';
import { activeTaxRates } from '../../profile/gst';

export type GstContext = {
  /** CGST + SGST, IGST, or no GST for this customer. */
  supply: GstSupply;
  registered: boolean;
  /** The organization's active GST rates, lowest first. */
  rates: number[];
  /** Picked on new quotes; 0 when not GST-registered. */
  defaultRate: number;
};

/**
 * GST for a customer, from the organization's GST settings: same state as
 * the organization → CGST + SGST, another state → IGST. Customers are matched
 * by name (that's what quotes and invoices store).
 */
export function useGst(customerName: string): GstContext {
  const { organization } = useSession();
  const { items: customers } = useCustomers();

  return useMemo(() => {
    const registered = organization?.gstRegistered ?? false;
    const organizationState = organization
      ? organization.gstState || organization.state
      : '';
    const name = customerName.trim().toLowerCase();
    const customerState =
      customers.find(c => c.name.trim().toLowerCase() === name)?.state ?? '';
    return {
      supply: gstSupply(registered, organizationState, customerState),
      registered,
      rates: organization ? activeTaxRates(organization.taxRates) : [],
      defaultRate: registered ? organization?.defaultTaxRate ?? 0 : 0,
    };
  }, [organization, customers, customerName]);
}

/** Dropdown options: the active rates, plus the document's own if retired. */
export function gstRateOptions(rates: number[], current: number) {
  const all =
    rates.includes(current) || current <= 0 ? rates : [...rates, current];
  return [...all]
    .sort((a, b) => a - b)
    .map(rate => ({ label: `${Number(rate.toFixed(2))}%`, value: rate }));
}
