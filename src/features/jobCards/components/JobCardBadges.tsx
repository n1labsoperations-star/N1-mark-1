import { memo } from 'react';
import { N1Badge } from '../../../shared/components';
import type { StatusMeta } from '../../../shared/types';
import { JOB_CARD_STATUS_META } from '../constants';
import type { JobCardStatus } from '../types';

export const JobCardStatusBadge = memo(function JobCardStatusBadgeComponent({
  status,
}: {
  status: JobCardStatus;
}) {
  const meta = JOB_CARD_STATUS_META[status];
  return <N1Badge label={meta.label} tone={meta.tone} dot />;
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
