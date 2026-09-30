import { runSaga } from 'redux-saga';
import type { UnknownAction } from '@reduxjs/toolkit';
import { createCrudSaga, createCrudSlice } from '../store';

type Row = { id: string; name: string };
type Input = { name: string };

const crud = createCrudSlice<Row, Input>('test', (a, b) =>
  a.name.localeCompare(b.name),
);
const { actions, reducer } = crud;

test('reducer tracks loading, saving and deleting', () => {
  let state = reducer(undefined, actions.fetchRequest());
  expect(state.status).toBe('loading');
  state = reducer(
    state,
    actions.fetchSuccess([
      { id: '2', name: 'b' },
      { id: '1', name: 'a' },
    ]),
  );
  expect(state.status).toBe('succeeded');
  expect(state.ids).toEqual(['1', '2']);
  state = reducer(state, actions.fetchFailure('boom'));
  expect(state).toMatchObject({ status: 'failed', error: 'boom' });

  state = reducer(state, actions.createRequest({ name: 'c' }));
  expect(state.saving).toBe(true);
  state = reducer(state, actions.saveSuccess({ id: '3', name: 'c' }));
  expect(state).toMatchObject({ saving: false, ids: ['1', '2', '3'] });
  state = reducer(
    state,
    actions.updateRequest({ id: '3', changes: { name: 'z' } }),
  );
  state = reducer(state, actions.saveFailure('nope'));
  expect(state).toMatchObject({ saving: false, saveError: 'nope' });

  state = reducer(state, actions.deleteRequest('1'));
  expect(state.deletingId).toBe('1');
  state = reducer(state, actions.deleteSuccess('1'));
  expect(state).toMatchObject({ deletingId: null, ids: ['2', '3'] });
  state = reducer(state, actions.deleteRequest('2'));
  state = reducer(state, actions.deleteFailure('locked'));
  expect(state).toMatchObject({ deletingId: null, deleteError: 'locked' });
  state = reducer(state, actions.clearErrors());
  expect(state).toMatchObject({ saveError: null, deleteError: null });
});

async function record(
  saga: (action: never) => Generator,
  action?: UnknownAction,
) {
  const dispatched: UnknownAction[] = [];
  await runSaga(
    { dispatch: (a: UnknownAction) => dispatched.push(a) },
    saga as (...args: unknown[]) => Generator,
    action,
  ).toPromise();
  return dispatched;
}

test('saga success paths', async () => {
  const api = {
    list: jest.fn().mockResolvedValue([{ id: '1', name: 'a' }]),
    create: jest.fn().mockResolvedValue({ id: '2', name: 'b' }),
    update: jest.fn().mockResolvedValue({ id: '2', name: 'c' }),
    remove: jest.fn().mockResolvedValue('2'),
  };
  const saga = createCrudSaga(actions, api, 'rows');
  expect(await record(saga.fetchAll)).toEqual([
    actions.fetchSuccess([{ id: '1', name: 'a' }]),
  ]);
  expect(
    await record(saga.create, actions.createRequest({ name: 'b' })),
  ).toEqual([actions.saveSuccess({ id: '2', name: 'b' })]);
  expect(
    await record(
      saga.update,
      actions.updateRequest({ id: '2', changes: { name: 'c' } }),
    ),
  ).toEqual([actions.saveSuccess({ id: '2', name: 'c' })]);
  expect(api.update).toHaveBeenCalledWith('2', { name: 'c' });
  expect(await record(saga.remove, actions.deleteRequest('2'))).toEqual([
    actions.deleteSuccess('2'),
  ]);
});

test('saga failure paths use the error message, or a fallback', async () => {
  const fail = jest.fn().mockRejectedValue(new Error('offline'));
  const failPlain = jest.fn().mockRejectedValue('weird');
  const saga = createCrudSaga(
    actions,
    { list: fail, create: failPlain, update: fail, remove: failPlain },
    'rows',
  );
  expect(await record(saga.fetchAll)).toEqual([
    actions.fetchFailure('offline'),
  ]);
  expect(
    await record(saga.create, actions.createRequest({ name: 'x' })),
  ).toEqual([actions.saveFailure('Failed to save rows')]);
  expect(
    await record(saga.update, actions.updateRequest({ id: '1', changes: {} })),
  ).toEqual([actions.saveFailure('offline')]);
  expect(await record(saga.remove, actions.deleteRequest('1'))).toEqual([
    actions.deleteFailure('Failed to delete rows'),
  ]);
});
