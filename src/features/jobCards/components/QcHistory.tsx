import { memo, useCallback } from 'react';
import { View } from 'react-native';
import {
  N1Badge,
  N1Table,
  N1Text,
  createN1Styles,
  useN1Styles,
  type N1TableColumn,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { formatDayMonth } from '../../../shared/utils';
import { JOB_CARD_STRINGS, QC_RESULT_META } from '../constants';
import type { QcEntry } from '../types';

const C = JOB_CARD_STRINGS.details.qcColumns;

const resultBadge = (e: QcEntry) => (
  <N1Badge
    label={QC_RESULT_META[e.result].label}
    tone={QC_RESULT_META[e.result].tone}
  />
);

const COLUMNS: N1TableColumn<QcEntry>[] = [
  {
    key: 'stage',
    title: C.stage,
    render: e => <N1Text weight="semiBold">{e.stage}</N1Text>,
  },
  { key: 'result', title: C.result, render: resultBadge },
  {
    key: 'remark',
    title: C.remark,
    flex: 1.5,
    render: e => (
      <N1Text color="secondary">{e.remark || COMMON_STRINGS.dash}</N1Text>
    ),
  },
  {
    key: 'date',
    title: C.date,
    render: e => <N1Text>{formatDayMonth(e.at)}</N1Text>,
  },
];

const makeStyles = createN1Styles(t => ({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
  },
  text: { flex: 1, gap: t.spacing.xxs },
}));

/** QC checks logged against the job: a table on wide screens, a list on phones. */
export const QcHistory = memo(function QcHistoryComponent({
  entries,
}: {
  entries: QcEntry[];
}) {
  const styles = useN1Styles(makeStyles);
  const renderCompactItem = useCallback(
    (e: QcEntry) => (
      <View style={styles.item}>
        <View style={styles.text}>
          <N1Text weight="semiBold">{e.stage}</N1Text>
          <N1Text variant="small" color="secondary">
            {`${e.remark || COMMON_STRINGS.dash} · ${formatDayMonth(e.at)}`}
          </N1Text>
        </View>
        {resultBadge(e)}
      </View>
    ),
    [styles],
  );
  if (!entries.length) {
    return <N1Text color="secondary">{JOB_CARD_STRINGS.details.noQc}</N1Text>;
  }
  return (
    <N1Table
      columns={COLUMNS}
      data={entries}
      keyExtractor={e => e.id}
      renderCompactItem={renderCompactItem}
      testID="qc-history"
    />
  );
});
