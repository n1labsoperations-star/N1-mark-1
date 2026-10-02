import { useCallback } from 'react';
import {
  N1Button,
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

  const createButton =
    tab === 'quotes' &&
    (isCompact ? (
      <N1IconButton
        icon="plus"
        variant="primary"
        accessibilityLabel={S.quotes.createA11y}
        onPress={createQuote}
        testID="create-quote"
      />
    ) : (
      <N1Button
        title={S.quotes.create}
        leftIcon="plus"
        onPress={createQuote}
        testID="create-quote"
      />
    ));

  return (
    <AdminScreen testID="billing-screen">
      <N1PageHeader
        title={S.title}
        subtitle={isCompact ? undefined : S.subtitle}
        right={createButton || undefined}
      />
      <N1Tabs
        tabs={BILLING_TABS}
        value={tab}
        onChange={setTab}
        fullWidth={isCompact}
      />
      {tab === 'invoices' ? <InvoicesTab /> : <QuotesTab />}
    </AdminScreen>
  );
}
