import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Divider,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { formatCurrency, formatRate } from '../../../shared/utils';
import { BILLING_STRINGS } from '../constants';
import type { Totals } from '../types';

const T = BILLING_STRINGS.totals;
const TOTALS_WIDTH = 300;

const makeStyles = createN1Styles(t => ({
  box: { gap: t.spacing.sm, width: TOTALS_WIDTH, alignSelf: 'flex-end' },
  compact: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
}));

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.row}>
      <N1Text
        variant={strong ? 'h3' : 'small'}
        color={strong ? 'primary' : 'secondary'}
      >
        {label}
      </N1Text>
      <N1Text
        variant={strong ? 'h2' : 'small'}
        weight="bold"
        testID={strong ? 'totals-total' : undefined}
      >
        {value}
      </N1Text>
    </View>
  );
}

/**
 * Subtotal, discount, GST (CGST + SGST or IGST) and total, right-aligned
 * under the operations.
 */
export const TotalsSummary = memo(function TotalsSummaryComponent({
  totals,
  fill = false,
}: {
  totals: Totals;
  /** Take the full width of its container (e.g. a side panel). */
  fill?: boolean;
}) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  return (
    <View style={[styles.box, (isCompact || fill) && styles.compact]}>
      <Row label={T.subtotal} value={formatCurrency(totals.subtotal)} />
      {totals.discount > 0 && (
        <Row label={T.discount} value={formatCurrency(-totals.discount)} />
      )}
      {totals.supply === 'none' ? (
        <Row label={T.noGst} value={formatCurrency(0)} />
      ) : totals.supply === 'inter' ? (
        <Row
          label={T.igst(formatRate(totals.gstRate))}
          value={formatCurrency(totals.igst)}
        />
      ) : (
        <>
          <Row
            label={T.cgst(formatRate(totals.gstRate / 2))}
            value={formatCurrency(totals.cgst)}
          />
          <Row
            label={T.sgst(formatRate(totals.gstRate / 2))}
            value={formatCurrency(totals.sgst)}
          />
        </>
      )}
      <N1Divider spacing="xs" />
      <Row label={T.total} value={formatCurrency(totals.total)} strong />
    </View>
  );
});
