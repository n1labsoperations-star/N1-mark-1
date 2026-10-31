import { useRef, useState } from 'react';
import { N1ConfirmDialog, N1Text } from '../../../shared/components';
import { useOnSettled } from '../../../shared/hooks';
import { useCustomers } from '../../customers';
import type { JobCard } from '../../jobCards/types';
import { BILLING_STRINGS } from '../constants';
import { useInvoices } from '../hooks/useBilling';
import { useBillingWorkflow } from '../hooks/useBillingWorkflow';
import { useGst } from '../hooks/useGst';
import { jobCardLabel } from '../workflow';

const S = BILLING_STRINGS.dispatch;

type Props = {
  visible: boolean;
  jobCard: JobCard;
  onClose: () => void;
  /**
   * The invoice to open. `fillRates` when it was just made from the job's
   * operations, so their rates still need filling in.
   */
  onInvoice: (invoiceId: string, fillRates: boolean) => void;
};

/**
 * Generate Dispatch: a confirmation, then the job goes to billing as a new
 * invoice from its operations. Already billed: the dialog opens that invoice.
 */
export function GenerateDispatchModal(props: Props) {
  // Invoices and customers load the first time it opens, not with every job
  // card that could be dispatched; it then stays mounted to fade out.
  const [opened, setOpened] = useState(props.visible);
  if (props.visible && !opened) {
    setOpened(true);
  }
  return opened ? <DispatchDialog {...props} /> : null;
}

function DispatchDialog({ visible, jobCard, onClose, onInvoice }: Props) {
  const { items: invoices, isLoading: loadingInvoices } = useInvoices();
  const gst = useGst(jobCard.customerName);
  const { generateInvoice, busy, error, invoiceId } = useBillingWorkflow();
  const requested = useRef(false);

  const { items: customers } = useCustomers();
  const existing = invoices.find(i => i.jobCardId === jobCard.id);
  const job = jobCardLabel(jobCard);
  // Checked before dispatching: otherwise the order would move to billing
  // and the invoice then be refused for want of the customer's state.
  const customer = customers.find(c => c.id === jobCard.customerId);
  const noState = !existing && !!customer && !customer.state.trim();

  useOnSettled(busy, error, () => {
    if (requested.current && invoiceId) {
      requested.current = false;
      onInvoice(invoiceId, true);
    }
  });

  const confirm = () => {
    if (existing) {
      onInvoice(existing.id, false);
      return;
    }
    if (noState) {
      return;
    }
    requested.current = true;
    generateInvoice(jobCard.id, null, gst.defaultRate);
  };

  return (
    <N1ConfirmDialog
      visible={visible}
      title={existing ? S.billedTitle : S.title}
      message={
        <>
          {existing
            ? S.existing(existing.number)
            : S.confirm(job, jobCard.customerName)}
          {(noState || error) && (
            <N1Text variant="small" color="danger">
              {`\n${noState ? S.noState(jobCard.customerName) : error}`}
            </N1Text>
          )}
        </>
      }
      confirmLabel={existing ? S.open : S.dispatch}
      tone="primary"
      icon="package"
      // Until the invoices load, an already billed job would look unbilled.
      loading={busy || loadingInvoices}
      onConfirm={confirm}
      onCancel={onClose}
      testID="dispatch-modal"
    />
  );
}
