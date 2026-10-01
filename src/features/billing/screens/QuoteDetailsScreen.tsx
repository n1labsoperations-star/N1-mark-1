import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Card,
  N1DetailGrid,
  N1Divider,
  N1IconButton,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import type { AdminScreenProps } from '../../../app/navigation/admin/types';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  StatGrid,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatCurrency, notifyUnavailable } from '../../../shared/utils';
import { QuoteStatusBadge } from '../components/BillingBadges';
import { BillingSection } from '../components/BillingSection';
import { LineItemsTable } from '../components/LineItemsTable';
import { TotalsSummary } from '../components/TotalsSummary';
import { BILLING_STRINGS, QUOTE_STATUS_META } from '../constants';
import { useQuote } from '../hooks/useBilling';
import { calculateTotals } from '../utils';

const Q = BILLING_STRINGS.quote;

const makeStyles = createN1Styles(t => ({
  body: { gap: t.spacing.lg },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  grow: { flex: 1 },
}));

export function QuoteDetailsScreen({
  route,
  navigation,
}: AdminScreenProps<'QuoteDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { quoteId } = route.params;
  const { quote, status, error, reload } = useQuote(quoteId);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const revise = useCallback(
    () => navigation.navigate('QuoteForm', { quoteId }),
    [navigation, quoteId],
  );
  const convert = useCallback(
    () => navigation.navigate('JobCards'),
    [navigation],
  );
  const downloadPdf = useCallback(
    () => notifyUnavailable(BILLING_STRINGS.invoice.downloadAction),
    [],
  );

  const totals = useMemo(
    () => (quote ? calculateTotals(quote.lineItems, quote.quantity) : null),
    [quote],
  );

  const statusLabel = quote ? QUOTE_STATUS_META[quote.status].label : '';
  const header = (
    <DetailHeader
      title={Q.title}
      subtitle={quote && `${quote.id} · ${statusLabel}`}
      onBack={goBack}
      right={quote && <QuoteStatusBadge status={quote.status} />}
      compactRight={
        quote && (
          <N1IconButton
            icon="edit"
            size="sm"
            accessibilityLabel={COMMON_STRINGS.edit}
            onPress={revise}
          />
        )
      }
    />
  );

  if (!quote || !totals) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="receipt" title={Q.title} message={Q.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const stats = [
    { key: 'total', label: Q.total, value: formatCurrency(totals.total) },
    { key: 'operations', label: Q.operations, value: quote.lineItems.length },
    {
      key: 'material',
      label: Q.material,
      value: quote.material || COMMON_STRINGS.dash,
    },
    { key: 'status', label: Q.status, value: statusLabel },
  ];

  const body = (
    <View style={styles.body}>
      {isCompact && <QuoteStatusBadge status={quote.status} />}
      <StatGrid items={stats} variant="muted" testID="quote-summary" />
      <View style={styles.actions}>
        <N1Button
          title={Q.convert}
          leftIcon="clipboard"
          onPress={convert}
          fullWidth={isCompact}
          testID="convert-quote"
        />
        <N1Button
          title={Q.revise}
          leftIcon="edit"
          variant="secondary"
          onPress={revise}
          style={isCompact && styles.grow}
          testID="revise-quote"
        />
        <N1Button
          title={isCompact ? Q.pdfShort : Q.downloadPdf}
          leftIcon="download"
          variant="secondary"
          onPress={downloadPdf}
          style={isCompact && styles.grow}
        />
      </View>
      <N1Divider />
      <N1DetailGrid
        columns={3}
        items={[
          { label: Q.customer, value: quote.customerName },
          { label: Q.partName, value: quote.partName },
          { label: Q.quantity, value: `${quote.quantity} pcs` },
        ]}
      />
      <N1Divider />
      <BillingSection title={BILLING_STRINGS.lineItems.title}>
        <LineItemsTable items={quote.lineItems} quantity={quote.quantity} />
      </BillingSection>
      <N1Divider />
      <TotalsSummary totals={totals} />
    </View>
  );

  return (
    <AdminScreen header={header} testID="quote-details-screen">
      {isCompact ? body : <N1Card padding="xxl">{body}</N1Card>}
    </AdminScreen>
  );
}
