import { useCallback, useState, type ReactNode } from 'react';
import { N1Tabs, useN1Breakpoint } from '../../../shared/components';
import { AdminScreen } from '../../../shared/components';
import { BillingHeaderSlot } from '../components/BillingHeaderSlot';
import { InvoicesTab } from '../components/InvoicesTab';
import { QuotesTab } from '../components/QuotesTab';
import { BILLING_TABS } from '../constants';
import type { BillingScreenProps, BillingTab } from '../types';

export function BillingScreen({
  route,
  navigation,
}: BillingScreenProps<'BillingHome'>) {
  const { isCompact } = useN1Breakpoint();
  // The tab lives in the route so Back from a quote returns to the Quotes tab.
  const tab: BillingTab = route.params?.tab ?? 'invoices';
  const setTab = useCallback(
    (next: BillingTab) => navigation.setParams({ tab: next }),
    [navigation],
  );
  // Phones: the open tab's search bar, shown on the black header.
  const [searchBar, setSearchBar] = useState<ReactNode>(null);

  const tabs = <N1Tabs tabs={BILLING_TABS} value={tab} onChange={setTab} />;

  return (
    <BillingHeaderSlot.Provider value={setSearchBar}>
      <AdminScreen
        header={isCompact ? searchBar : undefined}
        testID="billing-screen"
        fixed
      >
        {/* Phones: tabs above the cards. Wide screens: inside the table's
          toolbar, where the title would be. */}
        {isCompact && (
          <N1Tabs tabs={BILLING_TABS} value={tab} onChange={setTab} fullWidth />
        )}
        {tab === 'invoices' ? (
          <InvoicesTab toolbarStart={!isCompact && tabs} />
        ) : (
          <QuotesTab toolbarStart={!isCompact && tabs} />
        )}
      </AdminScreen>
    </BillingHeaderSlot.Provider>
  );
}
