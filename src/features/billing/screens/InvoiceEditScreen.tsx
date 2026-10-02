import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  N1Card,
  N1DetailGrid,
  N1Divider,
  N1DropDown,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import {
  AdminScreen,
  AsyncContent,
  ComingSoon,
  DetailHeader,
  FormFooter,
  FormRow,
} from '../../../shared/components';
import {
  COMMON_STRINGS,
  TOOLBAR_FILTER_MIN_WIDTH,
} from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { isNumeric, toNumber } from '../../../shared/utils';
import { BillingSection } from '../components/BillingSection';
import { LineItemsEditor } from '../components/LineItemsEditor';
import { TotalsSummary } from '../components/TotalsSummary';
import { BILLING_STRINGS, INVOICE_STATUS_OPTIONS } from '../constants';
import { useInvoice } from '../hooks/useBilling';
import { useLineItems } from '../hooks/useLineItems';
import type { BillingScreenProps, InvoiceStatus } from '../types';
import { calculateTotals } from '../utils';

const I = BILLING_STRINGS.invoice;
const L = BILLING_STRINGS.lineItems;

const makeStyles = createN1Styles(t => ({
  body: { gap: t.spacing.lg },
  top: { flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.lg },
  grow: { flex: 1 },
  status: { minWidth: TOOLBAR_FILTER_MIN_WIDTH },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.sm,
  },
}));

export function InvoiceEditScreen({
  route,
  navigation,
}: BillingScreenProps<'InvoiceEdit'>) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const { invoiceId } = route.params;
  const {
    invoice,
    status,
    error,
    reload,
    update,
    saving,
    saveError,
    clearErrors,
  } = useInvoice(invoiceId);
  const lines = useLineItems(invoice?.lineItems ?? []);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(
    invoice?.status ?? 'draft',
  );
  const [discount, setDiscount] = useState(
    invoice ? String(invoice.discount) : '0',
  );
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [discountError, setDiscountError] = useState<string>();
  const [linesError, setLinesError] = useState<string>();

  // Fill the form when the invoice first arrives (deep link / refresh), but not
  // again when this form's own save updates the store.
  const { reset: resetLines } = lines;
  const loadedId = useRef<string | null>(null);
  useEffect(() => {
    if (invoice && loadedId.current !== invoice.id) {
      loadedId.current = invoice.id;
      resetLines(invoice.lineItems);
      setInvoiceStatus(invoice.status);
      setDiscount(String(invoice.discount));
      setNotes(invoice.notes);
    }
  }, [invoice, resetLines]);

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  useOnSettled(saving, saveError, goBack);

  const totals = useMemo(
    () =>
      calculateTotals(lines.items, invoice?.quantity ?? 0, toNumber(discount)),
    [lines.items, invoice?.quantity, discount],
  );

  const save = useCallback(() => {
    const badDiscount =
      discount.trim() !== '' && (!isNumeric(discount) || Number(discount) < 0);
    setDiscountError(badDiscount ? COMMON_STRINGS.invalidNumber : undefined);
    setLinesError(lines.items.length === 0 ? L.needsOne : undefined);
    if (badDiscount || lines.items.length === 0) {
      return;
    }
    update(invoiceId, {
      status: invoiceStatus,
      lineItems: lines.items,
      discount: toNumber(discount),
      notes: notes.trim(),
    });
  }, [discount, lines.items, invoiceStatus, notes, update, invoiceId]);

  const header = (
    <DetailHeader title={I.editTitle} subtitle={invoiceId} onBack={goBack} />
  );

  if (!invoice) {
    return (
      <AdminScreen header={header}>
        <AsyncContent status={status} error={error} onRetry={reload}>
          <ComingSoon icon="receipt" title={I.editTitle} message={I.notFound} />
        </AsyncContent>
      </AdminScreen>
    );
  }

  const statusField = (
    <N1DropDown
      label={I.status}
      options={INVOICE_STATUS_OPTIONS}
      value={invoiceStatus}
      onChange={setInvoiceStatus}
      containerStyle={!isCompact && styles.status}
      testID="invoice-status"
    />
  );

  const footer = (
    <FormFooter
      onCancel={goBack}
      submitLabel={COMMON_STRINGS.save}
      onSubmit={save}
      loading={saving}
      compact={!isCompact}
      submitTestID="save-invoice"
    />
  );

  const body = (
    <View style={styles.body}>
      <View style={isCompact ? styles.body : styles.top}>
        <N1DetailGrid
          style={styles.grow}
          columns={isCompact ? 2 : 4}
          items={[
            { label: I.customer, value: invoice.customerName },
            { label: I.jobId, value: invoice.jobId },
            { label: I.partName, value: invoice.partName },
            { label: I.quantity, value: `${invoice.quantity} pcs` },
          ]}
        />
        {statusField}
      </View>
      <N1Divider />
      <BillingSection
        title={L.title}
        caption={isCompact ? L.customizableShort : L.customizableInvoice}
      >
        <LineItemsEditor controller={lines} quantity={invoice.quantity} />
        {linesError && (
          <N1Text variant="small" color="danger">
            {linesError}
          </N1Text>
        )}
      </BillingSection>
      <TotalsSummary totals={totals} />
      <N1Divider />
      <FormRow>
        <N1TextInput
          label={I.discount}
          value={discount}
          onChangeText={setDiscount}
          keyboardType="decimal-pad"
          errorText={discountError}
          testID="invoice-discount"
        />
        <N1TextInput
          label={I.notes}
          value={notes}
          onChangeText={setNotes}
          placeholder={COMMON_STRINGS.dash}
        />
      </FormRow>
      {saveError && (
        <N1Text variant="small" color="danger">
          {saveError}
        </N1Text>
      )}
    </View>
  );

  return (
    <AdminScreen
      header={header}
      compactFooter={footer}
      testID="invoice-edit-screen"
    >
      {isCompact ? body : <N1Card padding="xxl">{body}</N1Card>}
      {!isCompact && <View style={styles.footer}>{footer}</View>}
    </AdminScreen>
  );
}
