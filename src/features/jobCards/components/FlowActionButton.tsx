import { memo } from 'react';
import { N1IconButton } from '../../../shared/components';
import { JOB_CARD_STRINGS as S } from '../constants';
import type { JobCard } from '../types';

/** "+" opens Create flow for a card with no route yet; the pencil opens Edit flow. */
export const FlowActionButton = memo(function FlowActionButtonComponent({
  jobCard,
  onPress,
}: {
  jobCard: JobCard;
  onPress: (jobCard: JobCard) => void;
}) {
  const hasFlow = jobCard.operations.length > 0;
  return (
    <N1IconButton
      icon={hasFlow ? 'edit' : 'plus'}
      variant="primary"
      size="sm"
      accessibilityLabel={
        hasFlow ? S.a11y.editFlow(jobCard.id) : S.a11y.createFlow(jobCard.id)
      }
      onPress={() => onPress(jobCard)}
      testID={`flow-action-${jobCard.id}`}
    />
  );
});
