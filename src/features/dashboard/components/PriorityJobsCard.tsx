import { memo } from 'react';
import { Pressable, View } from 'react-native';
import {
  N1Button,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { formatDayMonth } from '../../../shared/utils';
import {
  OrderStatusBadge,
  PriorityMarker,
  orderTitle,
  type WorkOrder,
} from '../../orders';
import { DASHBOARD_STRINGS } from '../constants';

const S = DASHBOARD_STRINGS.jobs;

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.md,
    padding: t.spacing.xl,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
    borderTopWidth: t.borderWidth.hairline,
    borderTopColor: t.colors.border,
  },
  text: { flex: 1, gap: t.spacing.xxs },
  right: { alignItems: 'flex-end', gap: t.spacing.xs },
  pressed: { opacity: t.opacity.pressed },
}));

type Props = {
  jobs: readonly WorkOrder[];
  total: number;
  onOpenJob: (id: string) => void;
  onViewAll: () => void;
};

/** Upcoming work orders, earliest due first. */
export const PriorityJobsCard = memo(function PriorityJobsCardComponent({
  jobs,
  total,
  onOpenJob,
  onViewAll,
}: Props) {
  const styles = useN1Styles(makeStyles);
  return (
    <View style={styles.card} testID="priority-jobs-card">
      <View style={styles.header}>
        <N1Text variant="h3">{S.title}</N1Text>
        <N1Button
          title={S.viewAll(total)}
          variant="ghost"
          size="sm"
          onPress={onViewAll}
          testID="view-all-jobs"
        />
      </View>
      <View>
        {jobs.map(job => {
          const title = job.jobName || orderTitle(job);
          return (
            <Pressable
              key={job.id}
              accessibilityRole="button"
              accessibilityLabel={S.open(title)}
              onPress={() => onOpenJob(job.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              testID={`priority-job-${job.id}`}
            >
              <PriorityMarker priority={job.priority} />
              <View style={styles.text}>
                <N1Text weight="bold" numberOfLines={1}>
                  {title}
                </N1Text>
                <N1Text variant="caption" color="secondary" numberOfLines={1}>
                  {job.customerName}
                </N1Text>
              </View>
              <View style={styles.right}>
                <N1Text variant="caption" color="secondary">
                  {formatDayMonth(job.dueDate)}
                </N1Text>
                <OrderStatusBadge status={job.status} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
