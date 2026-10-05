import { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { COMMON_STRINGS } from '../../../shared/constants';
import { useOnSettled } from '../../../shared/hooks';
import { JOB_CARD_STRINGS, useJobCards } from '../../jobCards';
import { useOrders } from '../../orders';
import { JOBS_STRINGS, ROLE_JOBS } from '../constants';
import type { QcKind } from '../qc';
import type { JobsScreenProps } from '../types';
import { parseJobCode } from '../utils';
import { useMyJobs } from './useMyJobs';
import { useOpenOverTabs } from './useOpenOverTabs';

type Navigation = JobsScreenProps<'EnterJobCode'>['navigation'];
const S = JOBS_STRINGS.code;

/**
 * Imports a job from a typed or scanned code, shared by Enter Job Code and
 * Scan QR Code. Second Admin goes on to the order; the shop floor adds the
 * job and opens it once the import saga succeeds.
 *
 * `importCode` returns an error message for an invalid code, or `undefined`
 * once the import has started.
 */
export function useImportJobByCode(qcKind: QcKind = 'rm') {
  const navigation = useNavigation<Navigation>();
  const orders = useOrders();
  const jobCards = useJobCards();
  const myJobs = useMyJobs();
  const openOverTabs = useOpenOverTabs();
  const { importTo } = ROLE_JOBS[myJobs.role];
  const importing = useRef('');

  useOnSettled(myJobs.importing, myJobs.importError, () => {
    const jobCardId = importing.current;
    if (!jobCardId) {
      return;
    }
    importing.current = '';
    if (importTo === 'qc') {
      openOverTabs('QcCheck', { jobCardId, kind: qcKind });
    } else {
      openOverTabs('OperatorJob', { jobCardId });
    }
  });

  const { items: orderItems } = orders;
  const { items: jobCardItems } = jobCards;
  const { importJob } = myJobs;
  const importCode = useCallback(
    (code: string): string | undefined => {
      if (!code.trim()) {
        return COMMON_STRINGS.required;
      }
      // A code with no work order number (e.g. some other QR) isn't found.
      const orderId = parseJobCode(code);
      if (!orderId || !orderItems.some(o => o.id === orderId)) {
        return S.notFound(code.trim());
      }
      if (importTo === 'order') {
        navigation.navigate('ImportOrder', { orderId });
        return undefined;
      }
      // Operators can only run jobs that already have a route card; QC can
      // check any job card (raw material comes before the route).
      const jobCard = jobCardItems.find(c => c.id === orderId);
      if (!jobCard || (importTo === 'job' && !jobCard.operations.length)) {
        return S.noRoute(JOB_CARD_STRINGS.workOrder(orderId));
      }
      importing.current = orderId;
      importJob(orderId);
      return undefined;
    },
    [orderItems, jobCardItems, importJob, importTo, navigation],
  );

  return {
    importCode,
    loading: orders.isLoading || jobCards.isLoading || myJobs.importing,
    importError: myJobs.importError,
  } as const;
}
