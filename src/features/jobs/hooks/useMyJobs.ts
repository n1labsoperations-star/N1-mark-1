import { useCallback, useEffect, useMemo } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from '../../../app/store/hooks';
import type { RootState } from '../../../app/store';
import { selectJobCardsState } from '../../jobCards/store/selectors';
import { useEmployeeRole } from '../../profile/context/EmployeeRoleContext';
import { useEmployeeProfile } from '../../profile/hooks/useEmployeeProfile';
import { qcQueueKey, type QcQueueEntry } from '../qc';
import { myJobsActions } from '../store/myJobsSlice';
import { isOffMyJobs } from '../utils';
import type { WorkOrder } from '../../orders/types';
import type { RawMaterialInput } from '../types';

const selectMyJobs = (state: RootState) => state.myJobs;
const NO_IDS: string[] = [];

/**
 * The signed-in user's jobs (myJobs): an operator's assigned work, or the
 * jobs a supervisor or QC added to their list, as whole job cards.
 */
export function useMyJobs() {
  const role = useEmployeeRole();
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectMyJobs);
  const entities = useAppSelector(s => selectJobCardsState(s).entities);
  const myId = useEmployeeProfile().profile?.id ?? '';

  // Load when nothing is loaded yet, or another role's list is. Read the
  // store, not this render's state: screens that mount together (and a
  // focus reload) would otherwise each send the same request.
  const stale = state.status === 'idle' || state.role !== role;
  const store = useAppStore();
  useEffect(() => {
    const now = selectMyJobs(store.getState());
    if (now.status === 'idle' || now.role !== role) {
      dispatch(myJobsActions.fetchRequest(role));
    }
  }, [dispatch, role, stale, store]);

  // Another role's list is hidden while this one loads.
  const ids = stale ? NO_IDS : state.ids;
  // Finished jobs drop off: an operator's once they complete their step, a
  // supervisor's once the job is dispatched (Done).
  const items = useMemo(
    () =>
      ids.flatMap(id => {
        const card = entities[id];
        return card && !isOffMyJobs(card, role, myId) ? card : [];
      }),
    [ids, entities, role, myId],
  );
  const stats = useMemo(() => {
    const count = (status: string) =>
      items.filter(c => c.status === status).length;
    return {
      active: items.length - count('completed'),
      inProgress: count('in_progress'),
      total: items.length,
    };
  }, [items]);
  const qcQueue = useMemo(
    () =>
      new Map<string, QcQueueEntry>(
        state.qcQueue.map(e => [qcQueueKey(e.jobCardId, e.kind), e]),
      ),
    [state.qcQueue],
  );

  // This role's list already on its way answers a reload too.
  const reload = useCallback(() => {
    const now = selectMyJobs(store.getState());
    if (now.status !== 'loading' || now.role !== role) {
      dispatch(myJobsActions.fetchRequest(role));
    }
  }, [dispatch, role, store]);
  /** Finds the job behind a typed or scanned code. */
  const lookup = useCallback(
    (code: string) => dispatch(myJobsActions.lookupRequest({ role, code })),
    [dispatch, role],
  );
  const importJob = useCallback(
    (
      order: Pick<WorkOrder, 'id' | 'jobCardId'>,
      rawMaterial?: RawMaterialInput,
    ) =>
      dispatch(
        myJobsActions.importRequest({
          role,
          orderId: order.id,
          jobCardId: order.jobCardId,
          rawMaterial,
        }),
      ),
    [dispatch, role],
  );

  return {
    role,
    items,
    ids,
    stats,
    qcQueue,
    status: stale ? 'loading' : state.status,
    error: state.error,
    reload,
    lookup,
    found: state.found,
    importJob,
    importing: state.importing,
    importError: state.importError,
  } as const;
}
