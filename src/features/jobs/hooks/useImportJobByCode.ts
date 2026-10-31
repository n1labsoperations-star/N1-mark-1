import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../app/store/hooks';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { JOB_CARD_STRINGS } from '../../jobCards';
import { selectJobCardById } from '../../jobCards/store/selectors';
import { JOBS_STRINGS, ROLE_JOBS } from '../constants';
import { pendingQcKind, type QcKind } from '../qc';
import type { FoundJob } from '../store/myJobsSlice';
import type { JobsScreenProps } from '../types';
import { useMyJobs } from './useMyJobs';
import { useOpenOverTabs } from './useOpenOverTabs';

type Navigation = JobsScreenProps<'EnterJobCode'>['navigation'];
const S = JOBS_STRINGS.code;

/**
 * Opens a job from a typed or scanned code (jobCardByQr), shared by Enter
 * Job Code and Scan QR Code. The supervisor goes on to the order; QC adds
 * the job to their list and opens its check; an operator opens their job.
 *
 * `importCode` returns an error message for a blank code, or `undefined`
 * once the lookup has started; a code nothing matches shows `importError`.
 * With `confirmMs`, a found job shows `confirming` for that long first, so
 * the scanner can show its tick before the job opens.
 */
export function useImportJobByCode(qcKind: QcKind = 'rm', confirmMs = 0) {
  const navigation = useNavigation<Navigation>();
  const myJobs = useMyJobs();
  const openOverTabs = useOpenOverTabs();
  const { importTo } = ROLE_JOBS[myJobs.role];
  const looking = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const { found } = myJobs;
  const foundCard = useAppSelector(state =>
    found ? selectJobCardById(state, found.jobCardId) : undefined,
  );

  // Operators run jobs that have a route card; QC can check any job card.
  const routeMissing =
    importTo === 'job' && foundCard && !foundCard.operations.length
      ? S.noRoute(JOB_CARD_STRINGS.workOrder(foundCard.number))
      : null;

  const open = (job: FoundJob) => {
    if (importTo === 'order') {
      navigation.navigate('ImportOrder', { orderId: job.orderId });
    } else if (importTo === 'qc') {
      // The check waiting on QC, not just the tab it was scanned from.
      const kind = foundCard ? pendingQcKind(foundCard, qcKind) : qcKind;
      openOverTabs('QcCheck', { jobCardId: job.jobCardId, kind });
    } else {
      openOverTabs('OperatorJob', { jobCardId: job.jobCardId });
    }
  };

  useOnSettled(myJobs.importing, myJobs.importError, () => {
    if (!looking.current || !found) {
      return;
    }
    looking.current = false;
    if (routeMissing) {
      return;
    }
    if (!confirmMs) {
      open(found);
      return;
    }
    setConfirming(true);
    timer.current = setTimeout(() => {
      setConfirming(false);
      open(found);
    }, confirmMs);
  });

  const { lookup } = myJobs;
  const importCode = useCallback(
    (code: string): string | undefined => {
      if (!code.trim()) {
        return COMMON_STRINGS.required;
      }
      looking.current = true;
      lookup(code);
      return undefined;
    },
    [lookup],
  );

  return {
    importCode,
    loading: myJobs.importing,
    importError: myJobs.importError ?? routeMissing,
    confirming,
    /** The found job's work order, e.g. "WO #1036". */
    foundLabel: foundCard
      ? JOB_CARD_STRINGS.workOrder(foundCard.number)
      : undefined,
  } as const;
}
