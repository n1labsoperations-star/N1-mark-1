import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RequestStatus } from '../types';

type WithId = { id: string };

export type CrudState<T extends WithId> = EntityState<T, string> & {
  status: RequestStatus;
  error: string | null;
  /** A create or update is in flight. */
  saving: boolean;
  saveError: string | null;
  /** Id of the record being deleted, if any. */
  deletingId: string | null;
  deleteError: string | null;
};

export type UpdatePayload<Input> = { id: string; changes: Partial<Input> };

/**
 * List + create / update / delete for one kind of record, shared by every
 * admin feature. Sagas (createCrudSaga) listen for the *Request actions and
 * report back with *Success / *Failure.
 */
export function createCrudSlice<T extends WithId, Input>(
  name: string,
  sortComparer?: (a: T, b: T) => number,
) {
  const adapter = createEntityAdapter<T, string>({
    selectId: row => row.id,
    sortComparer,
  });

  const initialState: CrudState<T> = adapter.getInitialState({
    status: 'idle' as RequestStatus,
    error: null,
    saving: false,
    saveError: null,
    deletingId: null,
    deleteError: null,
  });

  // Immer drafts of generic entity state confuse TS; the adapter works on the draft as-is.
  const asState = (state: unknown) => state as CrudState<T>;

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      fetchRequest: state => {
        state.status = 'loading';
        state.error = null;
      },
      fetchSuccess: (state, action: PayloadAction<T[]>) => {
        adapter.setAll(asState(state), action.payload);
        state.status = 'succeeded';
      },
      fetchFailure: (state, action: PayloadAction<string>) => {
        state.status = 'failed';
        state.error = action.payload;
      },
      createRequest: (state, _action: PayloadAction<Input>) => {
        state.saving = true;
        state.saveError = null;
      },
      updateRequest: (state, _action: PayloadAction<UpdatePayload<Input>>) => {
        state.saving = true;
        state.saveError = null;
      },
      saveSuccess: (state, action: PayloadAction<T>) => {
        adapter.upsertOne(asState(state), action.payload);
        state.saving = false;
      },
      saveFailure: (state, action: PayloadAction<string>) => {
        state.saving = false;
        state.saveError = action.payload;
      },
      deleteRequest: (state, action: PayloadAction<string>) => {
        state.deletingId = action.payload;
        state.deleteError = null;
      },
      deleteSuccess: (state, action: PayloadAction<string>) => {
        adapter.removeOne(asState(state), action.payload);
        state.deletingId = null;
      },
      deleteFailure: (state, action: PayloadAction<string>) => {
        state.deletingId = null;
        state.deleteError = action.payload;
      },
      clearErrors: state => {
        state.saveError = null;
        state.deleteError = null;
      },
    },
  });

  return { slice, adapter, actions: slice.actions, reducer: slice.reducer };
}

export type CrudActions<T extends WithId, Input> = ReturnType<
  typeof createCrudSlice<T, Input>
>['actions'];
