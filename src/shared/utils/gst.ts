/**
 * GST for Indian invoices. A GST rate is configured once; amounts are always
 * calculated from the taxable value. Within a state the rate is split
 * equally into CGST + SGST; across states it is charged as IGST.
 */

/** Same state: CGST + SGST. Different states: IGST. 'none': no GST. */
export type GstSupply = 'intra' | 'inter' | 'none';

export type GstSplit = { cgst: number; sgst: number; igst: number };

/** 18 → { cgst: 9, sgst: 9, igst: 18 } (percentages). */
export function splitGstRate(rate: number): GstSplit {
  return { cgst: rate / 2, sgst: rate / 2, igst: rate };
}

/** "18%", "2.5%" */
export const formatRate = (rate: number) => `${Number(rate.toFixed(2))}%`;

/**
 * Intra-state when the organization and customer are in the same state,
 * inter-state otherwise. An unregistered organization charges no GST; an
 * unknown customer state is treated as the organization's own state.
 */
export function gstSupply(
  registered: boolean,
  organizationState: string,
  customerState: string,
): GstSupply {
  if (!registered) {
    return 'none';
  }
  if (!organizationState || !customerState) {
    return 'intra';
  }
  return organizationState.trim().toLowerCase() ===
    customerState.trim().toLowerCase()
    ? 'intra'
    : 'inter';
}

export type GstAmounts = GstSplit & { total: number };

/**
 * GST on a taxable value, to the rupee. CGST and SGST together always equal
 * the IGST amount, so the invoice total doesn't depend on the customer's
 * state.
 */
export function gstAmounts(
  taxable: number,
  rate: number,
  supply: GstSupply,
): GstAmounts {
  if (supply === 'none' || rate <= 0) {
    return { cgst: 0, sgst: 0, igst: 0, total: 0 };
  }
  const total = Math.round((taxable * rate) / 100);
  if (supply === 'inter') {
    return { cgst: 0, sgst: 0, igst: total, total };
  }
  const cgst = Math.round(total / 2);
  return { cgst, sgst: total - cgst, igst: 0, total };
}
