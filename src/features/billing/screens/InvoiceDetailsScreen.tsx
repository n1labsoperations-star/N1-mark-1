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
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatCurrency, notifyUnavailable } from '../../../shared/utils';
import { InvoiceStatusBadge } from '../components/BillingBadges';
import { BillingSection } from '../components/BillingSection';
import { LineItemsTable } from '../components/LineItemsTable';
import { TotalsSummary } from '../components/TotalsSummary';
import { BILLING_STRINGS, INVOICE_STATUS_META } from '../constants';
import { useInvoice } from '../hooks/useBilling';
import { calculateTotals } from '../utils';
import type { BillingScreenProps } from '../types';

const I = BILLING_STRINGS.invoice;

const makeStyles = createN1Styles(t => ({
  body: { gap: t.spacing.lg },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
  },
  compactActions: { flex: 1, gap: t.spacing.sm },
  row: { flexDirection: 'row', gap: t.spacing.sm },
  grow: { flex: 1 },
}));

export function InvoiceDetailsScreen({
  route,
  navigation,
}: BillingScreenProps<'InvoiceDetails'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { invoiceId } = route.params;
  const { invoice, status, error, reload, update, saving } =
    useInvoice(invoiceId);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const edit = useCallback(
    () => navigation.navigate('InvoiceEdit', { invoiceId }),
    [navigation, invoiceId],
  );
  const markPaid = useCallback(
    () => update(invoiceId, { status: 'paid' }),
    [update, invoiceId],
  );
  const send = useCallback(() => {
    if (invoice?.status === 'draft') {
      update(invoiceId, { status: 'pending' });
    } else {
      notifyUnavailable(I.resendAction);
    }
  }, [invoice?.status, update, invoiceId]);
  const downloadPdf = useCallback(
    () => notifyUnavailable(I.downloadAction),
    [],
  );

  const totals = useMemo(
    () =>
      invoice
        ? calculateTotals(invoice.lineItems, invoice.quantity, invoice.discount)
        : null,
    [invoice],
  );

  const editIcon = (
    <N1IconButton
      icon="edit"
      size="sm"
      accessibilityLabel={COMMON_STRINGS.edit}
      onPress={edit}
    />
  );
  const header = (
    <DetailHeader
      title={I.title}
      subtitle={
        invoice &&
        I.subtitle(invoice.id, INVOICE_STATUS_META[invoice.status].label)
      }
      onBack={goBack}
      right={
        invoice && (
          <>
            <InvoiceStatusBadge status={invoice.status} />
            <N1Button
              title={COMMON_STRINGS.edit}
              leftIcon="edit"
              variant="secondary"
              size="sm"
              onPress={edit}
              testID="edit-invoice"
            />
          </>
        )
      }
      compactRight={invoice && editIcon}
    />
  );

  if (!invoice || !totals) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="receipt" title={I.title} message={I.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const isPaid = invoice.status === 'paid';
  const sendButton = (
    <N1Button
      title={isCompact ? I.sendShort : I.send}
      leftIcon="arrow-right"
      variant="secondary"
      onPress={send}
      disabled={isPaid}
      style={isCompact && styles.grow}
      testID="send-invoice"
    />
  );
  const pdfButton = (
    <N1Button
      title={isCompact ? I.pdfShort : I.downloadPdf}
      leftIcon="download"
      variant="secondary"
      onPress={downloadPdf}
      style={isCompact && styles.grow}
    />
  );
  const paidButton = (
    <N1Button
      title={I.markPaid}
      leftIcon="check-circle"
      onPress={markPaid}
      disabled={isPaid}
      loading={saving}
      fullWidth={isCompact}
      testID="mark-paid"
    />
  );

  const summary = [
    { label: I.customer, value: invoice.customerName },
    { label: I.jobId, value: invoice.jobId },
    { label: I.partName, value: invoice.partName },
    { label: I.quantity, value: `${invoice.quantity} pcs` },
  ];

  const body = (
    <View style={styles.body}>
      {isCompact && <InvoiceStatusBadge status={invoice.status} />}
      <N1DetailGrid items={summary} columns={isCompact ? 2 : 4} />
      <N1Divider />
      <BillingSection title={BILLING_STRINGS.lineItems.title}>
        <LineItemsTable items={invoice.lineItems} quantity={invoice.quantity} />
      </BillingSection>
      <N1Divider />
      <TotalsSummary totals={totals} />
      <N1Divider />
      <BillingSection title={I.additional}>
        <N1DetailGrid
          items={[
            { label: I.discount, value: formatCurrency(invoice.discount) },
            { label: I.notes, value: invoice.notes || COMMON_STRINGS.dash },
          ]}
        />
      </BillingSection>
    </View>
  );

  return (
    <AdminScreen
      header={header}
      testID="invoice-details-screen"
      compactFooter={
        <View style={styles.compactActions}>
          <View style={styles.row}>
            {sendButton}
            {pdfButton}
          </View>
          {paidButton}
        </View>
      }
    >
      {isCompact ? body : <N1Card padding="xxl">{body}</N1Card>}
      {!isCompact && (
        <View style={styles.actions}>
          {sendButton}
          {pdfButton}
          {paidButton}
        </View>
      )}
    </AdminScreen>
  );
}
