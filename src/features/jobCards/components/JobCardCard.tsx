import { memo } from 'react';
import { View } from 'react-native';
import {
  N1Button,
  N1Text,
  createN1Styles,
  useN1Styles,
} from '../../../shared/components';
import { COMMON_STRINGS } from '../../../shared/constants';
import { JOB_CARD_STRINGS as S } from '../constants';
import type { JobCard } from '../types';
import { currentOperation, jobHeading, jobProgress } from '../utils';
import { FlowActionButton } from './FlowActionButton';
import { JobProgress } from './JobProgress';

const makeStyles = createN1Styles(t => ({
  card: {
    gap: t.spacing.sm,
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginTop: t.spacing.xs,
  },
  view: { flex: 1 },
}));

type Props = {
  jobCard: JobCard;
  onView: (jobCard: JobCard) => void;
  onFlow: (jobCard: JobCard) => void;
};

/** One job card on the phone list. */
export const JobCardCard = memo(function JobCardCardComponent({
  jobCard,
  onView,
  onFlow,
}: Props) {
  const styles = useN1Styles(makeStyles);
  const op = currentOperation(jobCard);
  const where = [op?.name, op?.machine].filter(Boolean).join(' · ');
  return (
    <View style={styles.card} testID={`job-card-${jobCard.id}`}>
      <N1Text variant="title" weight="bold">
        {jobHeading(jobCard)}
      </N1Text>
      <N1Text variant="small" color="secondary">
        {where || COMMON_STRINGS.dash}
      </N1Text>
      {op?.operator ? (
        <N1Text variant="small" color="secondary">
          {S.operator(op.operator)}
        </N1Text>
      ) : null}
      <JobProgress value={jobProgress(jobCard)} />
      <View style={styles.actions}>
        <View style={styles.view}>
          <N1Button
            title={S.view}
            leftIcon="eye"
            variant="secondary"
            fullWidth
            onPress={() => onView(jobCard)}
            accessibilityLabel={S.a11y.view(jobCard.id)}
          />
        </View>
        <FlowActionButton jobCard={jobCard} onPress={onFlow} />
      </View>
    </View>
  );
});
