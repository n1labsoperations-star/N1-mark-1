import { runSaga } from 'redux-saga';
import type { UnknownAction } from '@reduxjs/toolkit';
import * as api from '../src/services/api';
import { handleFetchUsers } from '../src/features/users/usersSaga';
import {
  fetchUsersFailure,
  fetchUsersSuccess,
} from '../src/features/users/usersSlice';
import usersReducer, {
  fetchUsersRequest,
} from '../src/features/users/usersSlice';
import counterReducer, {
  incrementAsync,
  incrementBy,
} from '../src/features/counter/counterSlice';

async function recordSaga(saga: () => Generator) {
  const dispatched: UnknownAction[] = [];
  await runSaga(
    { dispatch: (a: UnknownAction) => dispatched.push(a) },
    saga,
  ).toPromise();
  return dispatched;
}

afterEach(() => jest.restoreAllMocks());

test('handleFetchUsers dispatches success with users', async () => {
  const users = [{ id: 1, name: 'Test' }];
  jest.spyOn(api, 'fetchUsers').mockResolvedValue(users);

  expect(await recordSaga(handleFetchUsers)).toEqual([
    fetchUsersSuccess(users),
  ]);
});

test('handleFetchUsers dispatches failure on error', async () => {
  jest.spyOn(api, 'fetchUsers').mockRejectedValue(new Error('boom'));

  expect(await recordSaga(handleFetchUsers)).toEqual([
    fetchUsersFailure('boom'),
  ]);
});

test('users reducer tracks loading state', () => {
  const loading = usersReducer(undefined, fetchUsersRequest());
  expect(loading.isLoading).toBe(true);
  expect(usersReducer(loading, fetchUsersFailure('x'))).toMatchObject({
    isLoading: false,
    error: 'x',
  });
});

test('counter reducer handles async increment lifecycle', () => {
  const pending = counterReducer(undefined, incrementAsync());
  expect(pending.isPending).toBe(true);
  expect(counterReducer(pending, incrementBy(1))).toEqual({
    value: 1,
    isPending: false,
  });
});
