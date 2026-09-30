import { memo } from 'react';
import { N1Badge } from '../../../shared/components';
import { INVOICE_STATUS_META, QUOTE_STATUS_META } from '../constants';
import type { InvoiceStatus, QuoteStatus } from '../types';

export const InvoiceStatusBadge = memo(function InvoiceStatusBadgeComponent({
  status,
}: {
  status: InvoiceStatus;
}) {
  const meta = INVOICE_STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} />;
});

export const QuoteStatusBadge = memo(function QuoteStatusBadgeComponent({
  status,
}: {
  status: QuoteStatus;
}) {
  const meta = QUOTE_STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} />;
});
