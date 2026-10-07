import { memo } from 'react';
import { N1Badge } from '../../../shared/components';
import type { StatusMeta } from '../../../shared/types';
import type { JobCard } from '../types';
import { jobCardStage, stageMeta } from '../utils';

/** The job card's stage, e.g. "RM received", "Turning QC", "Done". */
export const JobCardStatusBadge = memo(function JobCardStatusBadgeComponent({
  jobCard,
}: {
  jobCard: JobCard;
}) {
  const meta = stageMeta(jobCardStage(jobCard));
  return (
    <N1Badge
      label={meta.label}
      tone={meta.tone}
      dot
      testID={`job-card-stage-${jobCard.id}`}
    />
  );
});

/** Badge for any status that has a label and tone (QC, quotation, billing…). */
export const MetaBadge = memo(function MetaBadgeComponent({
  meta,
  label,
  testID,
}: {
  meta: StatusMeta;
  /** Overrides the meta label, e.g. "Design approval: Approved". */
  label?: string;
  testID?: string;
}) {
  return (
    <N1Badge label={label ?? meta.label} tone={meta.tone} testID={testID} />
  );
});
