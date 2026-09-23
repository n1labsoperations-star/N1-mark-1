import { all, fork } from 'redux-saga/effects';
import counterSaga from '../features/counter/counterSaga';
import usersSaga from '../features/users/usersSaga';

export default function* rootSaga() {
  yield all([fork(counterSaga), fork(usersSaga)]);
}
