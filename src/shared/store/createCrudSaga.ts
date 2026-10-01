import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CrudActions, UpdatePayload } from './createCrudSlice';

export type CrudApi<T, Input> = {
  list: () => Promise<T[]>;
  create: (input: Input) => Promise<T>;
  update: (id: string, changes: Partial<Input>) => Promise<T>;
  remove: (id: string) => Promise<string>;
};

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/** Wires a createCrudSlice's *Request actions to an API object. */
export function createCrudSaga<T extends { id: string }, Input>(
  actions: CrudActions<T, Input>,
  api: CrudApi<T, Input>,
  noun: string,
) {
  function* fetchAll() {
    try {
      const rows: T[] = yield call(api.list);
      yield put(actions.fetchSuccess(rows));
    } catch (error) {
      yield put(
        actions.fetchFailure(errorMessage(error, `Failed to load ${noun}`)),
      );
    }
  }

  function* create(action: PayloadAction<Input>) {
    try {
      const row: T = yield call(api.create, action.payload);
      yield put(actions.saveSuccess(row));
    } catch (error) {
      yield put(
        actions.saveFailure(errorMessage(error, `Failed to save ${noun}`)),
      );
    }
  }

  function* update(action: PayloadAction<UpdatePayload<Input>>) {
    try {
      const { id, changes } = action.payload;
      const row: T = yield call(api.update, id, changes);
      yield put(actions.saveSuccess(row));
    } catch (error) {
      yield put(
        actions.saveFailure(errorMessage(error, `Failed to save ${noun}`)),
      );
    }
  }

  function* remove(action: PayloadAction<string>) {
    try {
      const id: string = yield call(api.remove, action.payload);
      yield put(actions.deleteSuccess(id));
    } catch (error) {
      yield put(
        actions.deleteFailure(errorMessage(error, `Failed to delete ${noun}`)),
      );
    }
  }

  function* watch() {
    yield takeLatest(actions.fetchRequest.type, fetchAll);
    yield takeEvery(actions.createRequest.type, create);
    yield takeEvery(actions.updateRequest.type, update);
    yield takeEvery(actions.deleteRequest.type, remove);
  }

  return { watch, fetchAll, create, update, remove };
}
