import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Card,
  N1Text,
  createN1Styles,
  useN1Styles,
  useN1Theme,
  type N1IconName,
} from '..';
import { COMMON_STRINGS } from '../../constants';
import type { ActivityEntry } from '../../types';
import { formatRelativeTime } from '../../utils';

export type ActivityCardProps = {
  items: readonly ActivityEntry[];
  title?: string;
  icon?: N1IconName;
  /**
   * inline: label left, time right ("Recent activity").
   * stacked: bold label, then time · detail underneath ("Status history").
   */
  layout?: 'inline' | 'stacked';
  /** Just the list, no card or title (inside a panel that has its own). */
  bare?: boolean;
  testID?: string;
};

const DOT_SIZE = 8;

const makeStyles = createN1Styles(t => ({
  list: { gap: t.spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: t.radius.pill,
    marginTop: (t.typography.small.lineHeight - DOT_SIZE) / 2,
  },
  text: { flex: 1, gap: t.spacing.xxs },
}));

function ActivityRow({
  entry,
  layout,
}: {
  entry: ActivityEntry;
  layout: 'inline' | 'stacked';
}) {
  const styles = useN1Styles(makeStyles);
  const theme = useN1Theme();
  const when = formatRelativeTime(entry.at);
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.dot,
          { backgroundColor: theme.colors.tone[entry.tone].solid },
        ]}
      />
      {layout === 'inline' ? (
        <>
          <N1Text variant="small" style={styles.text}>
            {entry.label}
          </N1Text>
          <N1Text variant="caption" color="secondary">
            {when}
          </N1Text>
        </>
      ) : (
        <View style={styles.text}>
          <N1Text variant="small" weight="bold">
            {entry.label}
          </N1Text>
          <N1Text variant="caption" color="secondary">
            {[when, entry.detail].filter(Boolean).join(' · ')}
          </N1Text>
        </View>
      )}
    </View>
  );
}

/** Dot-led feed of recent events. */
export const ActivityCard = memo(function ActivityCardComponent({
  items,
  title = COMMON_STRINGS.recentActivity,
  icon = 'clock',
  layout = 'inline',
  bare = false,
  testID,
}: ActivityCardProps) {
  const styles = useN1Styles(makeStyles);
  const list = (
    <View style={styles.list} testID={bare ? testID : undefined}>
      {items.length === 0 ? (
        <N1Text variant="small" color="secondary">
          {COMMON_STRINGS.empty}
        </N1Text>
      ) : (
        items.map(entry => (
          <ActivityRow key={entry.id} entry={entry} layout={layout} />
        ))
      )}
    </View>
  );
  return bare ? (
    list
  ) : (
    <N1Card title={title} icon={icon} testID={testID}>
      {list}
    </N1Card>
  );
});
