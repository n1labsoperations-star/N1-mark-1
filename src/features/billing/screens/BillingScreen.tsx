import { useCallback } from 'react';
import {
  N1IconButton,
  N1PageHeader,
  N1Tabs,
  useN1Breakpoint,
} from '../../../shared/components';
import { AdminScreen } from '../../../shared/components';
import { InvoicesTab } from '../components/InvoicesTab';
import { QuotesTab } from '../components/QuotesTab';
import { BILLING_STRINGS as S, BILLING_TABS } from '../constants';
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
  const createQuote = useCallback(
    () => navigation.navigate('QuoteForm'),
    [navigation],
  );

  const tabs = <N1Tabs tabs={BILLING_TABS} value={tab} onChange={setTab} />;

  return (
    <AdminScreen testID="billing-screen" fixed>
      {/* Wide screens: each tab's table carries its title, and the Quotes
          toolbar has Create; phones keep this header. */}
      {isCompact && (
        <N1PageHeader
          title={S.title}
          right={
            tab === 'quotes' ? (
              <N1IconButton
                icon="plus"
                variant="primary"
                accessibilityLabel={S.quotes.createA11y}
                onPress={createQuote}
                testID="create-quote"
              />
            ) : undefined
          }
        />
      )}
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
  );
}
