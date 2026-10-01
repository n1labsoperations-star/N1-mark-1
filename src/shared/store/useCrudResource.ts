import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import type { RootState } from '../../app/store';
import type { CrudActions, CrudState } from './createCrudSlice';

/**
 * Loads a CRUD slice on first use and exposes its list, status and mutations.
 * Features wrap this in their own hook (useCustomers, useMachines…).
 */
export function useCrudResource<T extends { id: string }, Input>(
  actions: CrudActions<T, Input>,
  selectState: (state: RootState) => CrudState<T>,
  selectAll: (state: RootState) => T[],
) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAll);
  const status = useAppSelector(state => selectState(state).status);
  const error = useAppSelector(state => selectState(state).error);
  const saving = useAppSelector(state => selectState(state).saving);
  const saveError = useAppSelector(state => selectState(state).saveError);
  const deletingId = useAppSelector(state => selectState(state).deletingId);
  const deleteError = useAppSelector(state => selectState(state).deleteError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(actions.fetchRequest());
    }
  }, [dispatch, actions, status]);

  const reload = useCallback(
    () => dispatch(actions.fetchRequest()),
    [dispatch, actions],
  );
  const create = useCallback(
    (input: Input) => dispatch(actions.createRequest(input)),
    [dispatch, actions],
  );
  const update = useCallback(
    (id: string, changes: Partial<Input>) =>
      dispatch(actions.updateRequest({ id, changes })),
    [dispatch, actions],
  );
  const remove = useCallback(
    (id: string) => dispatch(actions.deleteRequest(id)),
    [dispatch, actions],
  );
  const clearErrors = useCallback(
    () => dispatch(actions.clearErrors()),
    [dispatch, actions],
  );

  return useMemo(
    () => ({
      items,
      status,
      error,
      isLoading: status === 'idle' || status === 'loading',
      saving,
      saveError,
      deletingId,
      deleteError,
      reload,
      create,
      update,
      remove,
      clearErrors,
    }),
    [
      items,
      status,
      error,
      saving,
      saveError,
      deletingId,
      deleteError,
      reload,
      create,
      update,
      remove,
      clearErrors,
    ],
  );
}
