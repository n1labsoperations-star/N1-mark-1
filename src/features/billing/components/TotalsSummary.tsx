import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Divider,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../N1Modules';
import { formatCurrency } from '../../../shared/utils';
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

/** Subtotal, discount, GST and total, right-aligned under the operations. */
export const TotalsSummary = memo(function TotalsSummaryComponent({
  totals,
}: {
  totals: Totals;
}) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  return (
    <View style={[styles.box, isCompact && styles.compact]}>
      <Row label={T.subtotal} value={formatCurrency(totals.subtotal)} />
      {totals.discount > 0 && (
        <Row label={T.discount} value={formatCurrency(-totals.discount)} />
      )}
      <Row label={T.gst} value={formatCurrency(totals.gst)} />
      <N1Divider spacing="xs" />
      <Row label={T.total} value={formatCurrency(totals.total)} strong />
    </View>
  );
});
