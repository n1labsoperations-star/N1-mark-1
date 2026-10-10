import { createContext, useContext, useEffect, type ReactNode } from 'react';

/**
 * Phones: the open tab (Invoices / Quotes) puts its search and filter into
 * the Billing screen's header, where its search state can't reach.
 */
export const BillingHeaderSlot = createContext<
  ((header: ReactNode) => void) | null
>(null);

/** Shows `header` in the Billing screen's header while mounted. */
export function useBillingHeader(header: ReactNode, enabled: boolean) {
  const setHeader = useContext(BillingHeaderSlot);
  useEffect(() => {
    if (!setHeader || !enabled) {
      return undefined;
    }
    setHeader(header);
    return () => setHeader(null);
  }, [setHeader, enabled, header]);
}
