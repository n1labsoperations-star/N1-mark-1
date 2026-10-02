import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  FormFooter,
  N1Modal,
  N1SelectCard,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { useOnSettled } from '../../../shared/hooks';
import { formatCurrency } from '../../../shared/utils';
import type { JobCard } from '../../jobCards/types';
import { BILLING_STRINGS } from '../constants';
import { useInvoices, useQuotes } from '../hooks/useBilling';
import { useBillingWorkflow } from '../hooks/useBillingWorkflow';
import { useGst } from '../hooks/useGst';
import { quoteTotal } from '../utils';
import { jobReference, quotesForCustomer } from '../workflow';
import { QuoteStatusBadge } from './BillingBadges';

const S = BILLING_STRINGS.dispatch;
const NO_QUOTE = 'none';

const makeStyles = createN1Styles(t => ({
  list: { gap: t.spacing.md },
}));

type Props = {
  visible: boolean;
  jobCard: JobCard;
  onClose: () => void;
  /**
   * The invoice to open. `fillRates` when it was made without a quote, so
   * its operations still need rates.
   */
  onInvoice: (invoiceId: string, fillRates: boolean) => void;
};

/**
 * Generate Dispatch: pick the customer's quote (or none) and add the job to
 * billing as a draft invoice.
 */
export function GenerateDispatchModal({
  visible,
  jobCard,
  onClose,
  onInvoice,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { items: quotes } = useQuotes();
  const { items: invoices } = useInvoices();
  const gst = useGst(jobCard.customerName);
  const { generateInvoice, busy, error, invoiceId } = useBillingWorkflow();
  const [choice, setChoice] = useState<string | null>(null);
  const [mustPick, setMustPick] = useState(false);
  const requested = useRef<string | null>(null);

  const customerQuotes = useMemo(
    () => quotesForCustomer(quotes, jobCard.customerName),
    [quotes, jobCard.customerName],
  );
  const existing = invoices.find(i => i.jobId === jobReference(jobCard.id));
  // With no quotes to pick from, "No quote" is the only (pre-selected) choice.
  const selected = choice ?? (customerQuotes.length ? null : NO_QUOTE);

  useOnSettled(busy, error, () => {
    if (requested.current !== null && invoiceId) {
      const fillRates = requested.current === NO_QUOTE;
      requested.current = null;
      setChoice(null);
      onInvoice(invoiceId, fillRates);
    }
  });

  const confirm = () => {
    if (existing) {
      onInvoice(existing.id, false);
      return;
    }
    setMustPick(!selected);
    if (selected) {
      requested.current = selected;
      generateInvoice(
        jobCard.id,
        selected === NO_QUOTE ? null : selected,
        gst.defaultRate,
      );
    }
  };

  return (
    <N1Modal
      visible={visible}
      onClose={onClose}
      title={S.title}
      subtitle={S.subtitle(jobCard.customerName)}
      footer={
        <FormFooter
          onCancel={onClose}
          submitLabel={existing ? S.open : S.create}
          onSubmit={confirm}
          loading={busy}
          submitTestID="dispatch-submit"
        />
      }
      testID="dispatch-modal"
    >
      {existing ? (
        <N1Text color="secondary">{S.existing(existing.id)}</N1Text>
      ) : (
        <View style={styles.list}>
          {customerQuotes.length === 0 && (
            <N1Text color="secondary">
              {S.noQuotes(jobCard.customerName)}
            </N1Text>
          )}
          {customerQuotes.map(q => (
            <N1SelectCard
              key={q.id}
              title={`${q.id} · ${formatCurrency(quoteTotal(q))}`}
              subtitle={S.quoteLine(q.partName, q.quantity)}
              right={<QuoteStatusBadge status={q.status} />}
              selected={selected === q.id}
              onPress={() => setChoice(q.id)}
              testID={`dispatch-quote-${q.id}`}
            />
          ))}
          <N1SelectCard
            title={S.noQuote}
            subtitle={S.noQuoteHelp}
            selected={selected === NO_QUOTE}
            onPress={() => setChoice(NO_QUOTE)}
            testID="dispatch-no-quote"
          />
        </View>
      )}
      {(error || (mustPick && !selected)) && (
        <N1Text variant="small" color="danger">
          {error ?? S.pick}
        </N1Text>
      )}
    </N1Modal>
  );
}
