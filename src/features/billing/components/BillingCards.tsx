import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../N1Modules';
import { formatCurrency } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { Invoice, Quote } from '../types';
import { invoiceTotal } from '../utils';
import { InvoiceStatusBadge, QuoteStatusBadge } from './BillingBadges';

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.sm,
  },
  panel: {
    gap: t.spacing.xxs,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.background,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  end: { alignItems: 'flex-end' },
}));

type InvoiceCardProps = {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
};

export const InvoiceCard = memo(function InvoiceCardComponent({
  invoice,
  onView,
}: InvoiceCardProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID={`invoice-card-${invoice.id}`}>
      <View style={styles.top}>
        <View>
          <N1Text variant="title" weight="bold">
            {invoice.id}
          </N1Text>
          <N1Text variant="small" color="secondary">
            {invoice.customerName}
          </N1Text>
        </View>
        <InvoiceStatusBadge status={invoice.status} />
      </View>
      <View style={styles.panel}>
        <N1Text
          variant="small"
          weight="bold"
        >{`${invoice.jobId} · ${invoice.routeCard}`}</N1Text>
        <N1Text variant="caption" color="secondary">
          {BILLING_STRINGS.invoices.clientReference}
        </N1Text>
      </View>
      <View style={styles.bottom}>
        <N1Text variant="h3">{formatCurrency(invoiceTotal(invoice))}</N1Text>
        <N1Button
          title={BILLING_STRINGS.view}
          leftIcon="eye"
          variant="secondary"
          size="sm"
          onPress={() => onView(invoice)}
        />
      </View>
    </View>
  );
});

type QuoteCardProps = { quote: Quote; onView: (quote: Quote) => void };

export const QuoteCard = memo(function QuoteCardComponent({
  quote,
  onView,
}: QuoteCardProps) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID={`quote-card-${quote.id}`}>
      <View style={styles.top}>
        <View>
          <N1Text variant="title" weight="bold">
            {quote.id}
          </N1Text>
          <N1Text variant="small" color="secondary">
            {quote.customerName}
          </N1Text>
        </View>
        <QuoteStatusBadge status={quote.status} />
      </View>
      <View style={styles.end}>
        <N1Button
          title={BILLING_STRINGS.view}
          leftIcon="eye"
          variant="secondary"
          size="sm"
          onPress={() => onView(quote)}
        />
      </View>
    </View>
  );
});
