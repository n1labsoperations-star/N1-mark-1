import { delay, put, takeLatest } from 'redux-saga/effects';
import { incrementAsync, incrementBy } from './counterSlice';

const ASYNC_INCREMENT_DELAY_MS = 1000;

export function* handleIncrementAsync() {
  yield delay(ASYNC_INCREMENT_DELAY_MS);
  yield put(incrementBy(1));
}

export default function* counterSaga() {
  yield takeLatest(incrementAsync.type, handleIncrementAsync);
}
