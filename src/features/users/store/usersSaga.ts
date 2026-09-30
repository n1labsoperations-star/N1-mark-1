import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchUsers } from '../api/usersApi';
import type { User } from '../types';
import {
  fetchUsersFailure,
  fetchUsersRequest,
  fetchUsersSuccess,
} from './usersSlice';

export function* handleFetchUsers() {
  try {
    const users: User[] = yield call(fetchUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(
      fetchUsersFailure(
        error instanceof Error ? error.message : 'Failed to load users',
      ),
    );
  }
}

export default function* usersSaga() {
  yield takeLatest(fetchUsersRequest.type, handleFetchUsers);
}
