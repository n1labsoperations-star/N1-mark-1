import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  AdminScreen,
  AsyncContent,
  DetailHeader,
  ComingSoon,
  FormFooter,
  N1Button,
  N1DetailGrid,
  N1DropDown,
  N1Text,
  N1TextInput,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { printOrNotify } from '../../../services/print';
import {
  formatCurrency,
  notifyUnavailable,
  toNumber,
} from '../../../shared/utils';
import { useSession } from '../../profile';
import { InvoiceStatusBadge } from '../components/BillingBadges';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import {
  BillingBackLink,
  BillingDetailLayout,
} from '../components/BillingDetailLayout';
import { BillingSection } from '../components/BillingSection';
import { LineItemsEditor } from '../components/LineItemsEditor';
import { LineItemsTable } from '../components/LineItemsTable';
import { TotalsSummary } from '../components/TotalsSummary';
import { BILLING_STRINGS, INVOICE_STATUS_OPTIONS } from '../constants';
import { parseJobCode } from '../../jobs/utils';
import { useOrder } from '../../orders/hooks/useOrders';
import { useInvoice } from '../hooks/useBilling';
import { gstRateOptions, useGst } from '../hooks/useGst';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import {
  invoiceDocument,
  invoiceHtml,
  type InvoiceDocument,
} from '../invoiceDocument';
import { calculateTotals } from '../utils';
import type { BillingScreenProps } from '../types';

const I = BILLING_STRINGS.invoice;
const T = BILLING_STRINGS.totals;
/** Room for a lakh-sized amount beside the title. */
const PO_INPUT_WIDTH = 160;

const makeStyles = createN1Styles(t => ({
  pressed: { opacity: t.opacity.pressed },
  jobLink: { alignSelf: 'flex-start' },
  underline: { textDecorationLine: 'underline' },
  asideActions: { gap: t.spacing.sm },
  fields: { gap: t.spacing.md },
  fieldRow: { flexDirection: 'row', gap: t.spacing.md },
  // Beside the title: "PO amount ₹70,000", or its input while editing.
  // The label on top (level with the title), the amount (or its input)
  // at the bottom (level with the invoice number).
  poAmount: { justifyContent: 'space-between', gap: t.spacing.xxs },
  poInput: { width: PO_INPUT_WIDTH },
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
  const { invoiceId, fromJobCardId, edit: editRequested } = route.params;
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

  // Edit turns the operations, status, discount, GST rate and notes into
  // inputs right here; Save or Cancel turns them back.
  const form = useInvoiceForm(invoice);
  const [editing, setEditing] = useState(false);
  const { reset: resetForm } = form;
  const startEdit = useCallback(() => {
    clearErrors();
    resetForm();
    setEditing(true);
  }, [clearErrors, resetForm]);
  const cancelEdit = useCallback(() => {
    resetForm();
    setEditing(false);
  }, [resetForm]);
  const save = useCallback(() => {
    const changes = form.validate();
    if (changes) {
      update(invoiceId, changes);
    }
  }, [form, update, invoiceId]);
  useOnSettled(saving, saveError, () => setEditing(false));
  // Opened with edit (the list's Edit, or a job card's "fill in the rates").
  useEffect(() => {
    if (editRequested && invoice) {
      startEdit();
      navigation.setParams({ edit: undefined });
    }
  }, [editRequested, invoice, startEdit, navigation]);

  // Back to the job card the invoice was opened from (keeping that page's
  // own Back), else always to the Billing list.
  const goBack = useCallback(() => {
    if (fromJobCardId) {
      navigation.navigate('JobCards', {
        screen: 'JobCardDetails',
        params: { jobCardId: fromJobCardId },
        merge: true,
      });
    } else {
      navigation.popTo('BillingHome');
    }
  }, [navigation, fromJobCardId]);
  const backLabel = fromJobCardId ? I.backToJobCard : I.back;
  // "WO-00125" → work order "125": the job links to its order when there is
  // one, and Back on the order returns here.
  const orderId = invoice ? parseJobCode(invoice.jobId) : '';
  const { order } = useOrder(orderId || undefined);
  const openOrder = useCallback(
    () =>
      navigation.navigate('Orders', {
        screen: 'OrderDetails',
        params: { orderId, fromInvoiceId: invoiceId },
        initial: false,
      }),
    [navigation, orderId, invoiceId],
  );
  const markPaid = useCallback(
    () => update(invoiceId, { status: 'paid' }),
    [update, invoiceId],
  );
  // Sending (and re-sending) needs the backend; the status stays New.
  const send = useCallback(() => notifyUnavailable(I.sendAction), []);
  // Preview Invoice: the invoice as it prints, from what's saved.
  const { organization } = useSession();
  const [preview, setPreview] = useState<InvoiceDocument | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const print = useCallback(
    (doc: InvoiceDocument) =>
      printOrNotify(invoiceHtml(doc), doc.title, doc.printAction),
    [],
  );
  const downloadPdf = useCallback(
    () => notifyUnavailable(I.downloadAction),
    [],
  );

  const gst = useGst(invoice?.customerName ?? '');
  // While editing, the amounts follow the inputs.
  const totals = useMemo(() => {
    if (!invoice) {
      return null;
    }
    return editing
      ? calculateTotals(
          form.lines.items,
          invoice.quantity,
          toNumber(form.discount),
          form.gstRate,
          gst.supply,
        )
      : calculateTotals(
          invoice.lineItems,
          invoice.quantity,
          invoice.discount,
          invoice.gstRate,
          gst.supply,
        );
  }, [
    invoice,
    editing,
    form.lines.items,
    form.discount,
    form.gstRate,
    gst.supply,
  ]);

  const backLink = (
    <BillingBackLink label={backLabel} onPress={goBack} testID="invoice-back" />
  );

  // Phones: a header with back and the screen's name, in place of the link.
  const header = <DetailHeader title={I.title} onBack={goBack} />;

  if (!invoice || !totals) {
    return (
      <AdminScreen header={header} testID="invoice-details-screen">
        {!isCompact && backLink}
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
      fullWidth={!isCompact}
      testID="send-invoice"
    />
  );
  const previewButton = (
    <N1Button
      title={isCompact ? I.previewShort : I.preview}
      leftIcon="eye"
      variant="secondary"
      onPress={() =>
        totals && setPreview(invoiceDocument(invoice, totals, organization))
      }
      style={isCompact && styles.grow}
      fullWidth={!isCompact}
      testID="preview-invoice"
    />
  );
  const pdfButton = (
    <N1Button
      title={isCompact ? I.pdfShort : I.downloadPdf}
      leftIcon="download"
      variant="secondary"
      onPress={downloadPdf}
      style={isCompact && styles.grow}
      fullWidth={!isCompact}
    />
  );
  const paidButton = (
    <N1Button
      title={I.markPaid}
      leftIcon="check-circle"
      onPress={markPaid}
      disabled={isPaid}
      loading={saving}
      fullWidth
      testID="mark-paid"
    />
  );

  const saveFooter = (
    <FormFooter
      onCancel={cancelEdit}
      submitLabel={COMMON_STRINGS.save}
      onSubmit={save}
      loading={saving}
      compact={!isCompact}
      submitTestID="save-invoice"
    />
  );

  // The customer's PO value, entered by hand, beside the title.
  const poAmount = (
    <View style={styles.poAmount} testID="invoice-po-amount">
      <N1Text variant="overline">{I.poAmount}</N1Text>
      {editing ? (
        <N1TextInput
          value={form.poAmount}
          onChangeText={form.setPoAmount}
          keyboardType="decimal-pad"
          placeholder={I.poAmountPlaceholder}
          accessibilityLabel={I.poAmount}
          errorText={form.poAmountError}
          containerStyle={styles.poInput}
          testID="invoice-po-amount-input"
        />
      ) : (
        <N1Text weight="bold">
          {invoice.poAmount == null
            ? COMMON_STRINGS.dash
            : formatCurrency(invoice.poAmount)}
        </N1Text>
      )}
    </View>
  );

  const headerRight = editing ? (
    !isCompact && saveFooter
  ) : (
    <N1Button
      title={COMMON_STRINGS.edit}
      leftIcon="edit"
      variant="secondary"
      size="sm"
      onPress={startEdit}
      testID="edit-invoice"
    />
  );

  const summary = [
    { label: I.customer, value: invoice.customerName },
    {
      label: I.jobId,
      value: order ? (
        // A text link, so it lines up with the other values.
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={I.openOrder(invoice.jobId)}
          onPress={openOrder}
          style={({ pressed }) => [styles.jobLink, pressed && styles.pressed]}
          testID="invoice-order-link"
        >
          <N1Text weight="bold" style={styles.underline}>
            {invoice.jobId}
          </N1Text>
        </Pressable>
      ) : (
        invoice.jobId
      ),
    },
    { label: I.routeCard, value: invoice.routeCard },
    { label: I.partName, value: invoice.partName },
    { label: I.quantity, value: `${invoice.quantity} pcs` },
  ];

  const operations = (
    <>
      {editing ? (
        <LineItemsEditor
          controller={form.lines}
          quantity={invoice.quantity}
          scrollable={!isCompact}
        />
      ) : (
        <LineItemsTable
          items={invoice.lineItems}
          quantity={invoice.quantity}
          scrollable={!isCompact}
        />
      )}
      {editing && form.linesError && (
        <N1Text variant="small" color="danger">
          {form.linesError}
        </N1Text>
      )}
    </>
  );

  // Right: the money, in the grey box; edit fields in place of the actions.
  const amounts = (
    <>
      <BillingSection title={I.amount}>
        <TotalsSummary totals={totals} fill />
      </BillingSection>
      {editing ? (
        <View style={styles.fields}>
          <N1DropDown
            label={I.status}
            options={INVOICE_STATUS_OPTIONS}
            value={form.status}
            onChange={form.setStatus}
            testID="invoice-status"
          />
          <View style={styles.fieldRow}>
            <N1TextInput
              label={I.discount}
              value={form.discount}
              onChangeText={form.setDiscount}
              keyboardType="decimal-pad"
              errorText={form.discountError}
              containerStyle={styles.grow}
              testID="invoice-discount"
            />
            {gst.registered && (
              <N1DropDown
                label={T.gstRate}
                options={gstRateOptions(gst.rates, form.gstRate)}
                value={form.gstRate}
                onChange={form.setGstRate}
                placeholder={T.gstRatePlaceholder}
                containerStyle={styles.grow}
                testID="invoice-gst-rate"
              />
            )}
          </View>
          {saveError && (
            <N1Text variant="small" color="danger">
              {saveError}
            </N1Text>
          )}
        </View>
      ) : (
        !isCompact && (
          <View style={styles.asideActions}>
            {paidButton}
            {sendButton}
            {previewButton}
            {pdfButton}
          </View>
        )
      )}
    </>
  );
  // Notes sit under the amounts so the operations get the full left side.
  const notes = (
    <BillingSection title={I.notes}>
      {editing ? (
        <N1TextInput
          value={form.notes}
          onChangeText={form.setNotes}
          placeholder={COMMON_STRINGS.dash}
          accessibilityLabel={I.notes}
          multiline
          testID="invoice-notes"
        />
      ) : (
        <N1Text>{invoice.notes || COMMON_STRINGS.dash}</N1Text>
      )}
    </BillingSection>
  );
  return (
    <>
      <BillingDetailLayout
        testID="invoice-details-screen"
        header={header}
        back={!isCompact && backLink}
        title={I.title}
        badge={<InvoiceStatusBadge status={invoice.status} />}
        titleExtra={poAmount}
        subtitle={invoice.id}
        headerRight={headerRight}
        summary={
          <N1DetailGrid
            items={summary}
            columns={isCompact ? 2 : summary.length}
          />
        }
        operations={operations}
        amounts={amounts}
        aside={notes}
        compactFooter={
          editing ? (
            saveFooter
          ) : (
            <View style={styles.compactActions}>
              <View style={styles.row}>
                {sendButton}
                {previewButton}
                {pdfButton}
              </View>
              {paidButton}
            </View>
          )
        }
      />
      <InvoicePreviewModal
        doc={preview}
        onClose={closePreview}
        onPrint={print}
        onDownload={downloadPdf}
      />
    </>
  );
}
