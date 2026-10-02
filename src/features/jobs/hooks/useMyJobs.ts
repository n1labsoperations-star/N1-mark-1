import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import type { RootState } from '../../../app/store';
import { useJobCards } from '../../jobCards';
import { useEmployeeRole } from '../../profile/context/EmployeeRoleContext';
import { myJobsActions } from '../store/myJobsSlice';
import type { RawMaterialInput } from '../types';

const selectMyJobs = (state: RootState) => state.myJobs;
const NO_IDS: string[] = [];

/** The signed-in user's jobs (their job cards), newest import first. */
export function useMyJobs() {
  const role = useEmployeeRole();
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectMyJobs);
  const jobCards = useJobCards();

  // Load when nothing is loaded yet, or another role's list is.
  const stale = state.status === 'idle' || state.role !== role;
  useEffect(() => {
    if (stale) {
      dispatch(myJobsActions.fetchRequest(role));
    }
  }, [dispatch, role, stale]);

  // Another role's list is hidden while this one loads.
  const ids = stale ? NO_IDS : state.ids;
  const items = useMemo(
    () => ids.flatMap(id => jobCards.items.find(c => c.id === id) ?? []),
    [ids, jobCards.items],
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

  const reload = useCallback(() => {
    dispatch(myJobsActions.fetchRequest(role));
    jobCards.reload();
  }, [dispatch, role, jobCards]);
  const importJob = useCallback(
    (orderId: string, rawMaterial?: RawMaterialInput) =>
      dispatch(myJobsActions.importRequest({ role, orderId, rawMaterial })),
    [dispatch, role],
  );

  // Loaded only once both the list and the job cards are in.
  const failed = state.status === 'failed' || jobCards.status === 'failed';
  const loaded =
    !stale && state.status === 'succeeded' && jobCards.status === 'succeeded';
  return {
    role,
    items,
    ids,
    stats,
    status: failed ? 'failed' : loaded ? 'succeeded' : 'loading',
    error: state.error ?? jobCards.error,
    reload,
    importJob,
    importing: state.importing,
    importError: state.importError,
  } as const;
}
