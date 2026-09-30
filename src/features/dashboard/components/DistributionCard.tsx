import { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import {
  N1Badge,
  N1Button,
  N1Chip,
  N1Icon,
  N1Text,
  createN1Styles,
  useN1Breakpoint,
  useN1Styles,
} from '../../../shared/components';
import { DonutChart } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils';
import type { CustomerShare } from '../../customers';
import { DASHBOARD_STRINGS } from '../constants';

const S = DASHBOARD_STRINGS.distribution;
const DOT = 10;

const makeStyles = createN1Styles(t => ({
  card: {
    flex: 1,
    gap: t.spacing.lg,
    padding: t.spacing.xl,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  titles: { flex: 1, gap: t.spacing.xs },
  pipeline: { alignItems: 'flex-end' },
  body: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xxl },
  compactBody: { alignItems: 'center', gap: t.spacing.lg },
  table: { flex: 1 },
  compactTable: { alignSelf: 'stretch' },
  headRow: {
    flexDirection: 'row',
    gap: t.spacing.md,
    paddingBottom: t.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  compactRow: {
    gap: t.spacing.xs,
    paddingVertical: t.spacing.md,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  name: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  grow: { flex: 1 },
  num: { flex: 1, textAlign: 'right' },
  money: { flex: 1.4, textAlign: 'right' },
  chevron: { width: t.iconSize.sm },
  dot: { width: DOT, height: DOT, borderRadius: t.radius.xs },
  pressed: { opacity: t.opacity.pressed },
  viewMore: { alignSelf: 'flex-start' },
  compactViewMore: { alignSelf: 'center' },
}));

type Props = {
  shares: readonly CustomerShare[];
  topCustomers: readonly CustomerShare[];
  activeOrders: number;
  onOpenCustomer: (id: string) => void;
  onViewMore: () => void;
};

/** Donut of active orders by customer, with a breakdown table. */
export const DistributionCard = memo(function DistributionCardComponent({
  shares,
  topCustomers,
  activeOrders,
  onOpenCustomer,
  onViewMore,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const { isCompact } = useN1Breakpoint();
  const segments = useMemo(
    () =>
      shares.map(s => ({
        key: s.id,
        value: s.orders,
        color: s.color,
        label: s.name,
      })),
    [shares],
  );

  const dot = (color: string) => (
    <View style={[styles.dot, { backgroundColor: color }]} />
  );

  const desktopRows = topCustomers.map(c => (
    <Pressable
      key={c.id}
      accessibilityRole="button"
      accessibilityLabel={S.open(c.name)}
      onPress={() => onOpenCustomer(c.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.name}>
        {dot(c.color)}
        <N1Text weight="semiBold" numberOfLines={1}>
          {c.name}
        </N1Text>
      </View>
      <N1Text style={styles.num}>{`${c.percent}%`}</N1Text>
      <N1Text style={styles.money}>{formatCurrency(c.totalRevenue)}</N1Text>
      <N1Text style={styles.money}>
        {formatCurrency(c.outstandingBalance)}
      </N1Text>
      <View style={styles.chevron}>
        <N1Icon name="chevron-right" size="sm" color="textTertiary" />
      </View>
    </Pressable>
  ));

  const compactRows = topCustomers.map(c => (
    <Pressable
      key={c.id}
      accessibilityRole="button"
      accessibilityLabel={S.open(c.name)}
      onPress={() => onOpenCustomer(c.id)}
      style={({ pressed }) => [styles.compactRow, pressed && styles.pressed]}
    >
      <View style={styles.line}>
        {dot(c.color)}
        <N1Text weight="bold" style={styles.grow} numberOfLines={1}>
          {c.name}
        </N1Text>
        <N1Chip value={S.orders(c.orders)} />
        <N1Text weight="bold">{`${c.percent}%`}</N1Text>
        <N1Icon name="chevron-right" size="sm" color="textTertiary" />
      </View>
      <View style={styles.line}>
        <N1Text variant="caption" color="secondary" style={styles.grow}>
          {S.billed(formatCurrency(c.totalRevenue))}
        </N1Text>
        <N1Text variant="caption" color="secondary">
          {S.outstanding(formatCurrency(c.outstandingBalance))}
        </N1Text>
      </View>
    </Pressable>
  ));

  return (
    <View style={styles.card} testID="distribution-card">
      <View style={styles.header}>
        <View style={styles.titles}>
          <View style={styles.titleRow}>
            <N1Text variant="h3">{S.title}</N1Text>
            <N1Badge
              label={
                isCompact
                  ? S.activeBadgeShort(activeOrders)
                  : S.activeBadge(activeOrders)
              }
              tone="info"
              dot
            />
          </View>
          <N1Text variant="small" color="secondary">
            {S.subtitle}
          </N1Text>
        </View>
        {!isCompact && (
          <View style={styles.pipeline}>
            <N1Text variant="caption" color="secondary">
              {S.pipeline}
            </N1Text>
            <N1Text variant="h3">{S.orders(activeOrders)}</N1Text>
          </View>
        )}
      </View>

      <View style={isCompact ? styles.compactBody : styles.body}>
        <DonutChart
          segments={segments}
          centerLabel={S.total}
          centerValue={activeOrders}
          centerCaption={S.ordersCaption}
        />
        <View style={isCompact ? styles.compactTable : styles.table}>
          {!isCompact && (
            <View style={styles.headRow}>
              <N1Text variant="overline" style={styles.name}>
                {S.columns.customer}
              </N1Text>
              <N1Text variant="overline" style={styles.num}>
                {S.columns.orders}
              </N1Text>
              <N1Text variant="overline" style={styles.money}>
                {S.columns.billed}
              </N1Text>
              <N1Text variant="overline" style={styles.money}>
                {S.columns.outstanding}
              </N1Text>
              <View style={styles.chevron} />
            </View>
          )}
          {isCompact ? compactRows : desktopRows}
        </View>
      </View>
      <N1Button
        title={S.viewMore}
        rightIcon="chevron-right"
        variant="secondary"
        size="sm"
        onPress={onViewMore}
        style={isCompact ? styles.compactViewMore : styles.viewMore}
        testID="view-more-customers"
      />
    </View>
  );
});
