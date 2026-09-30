import { all, fork } from 'redux-saga/effects';
import { counterSaga } from '../../features/counter';
import { usersSaga } from '../../features/users';

export default function* rootSaga() {
  yield all([fork(counterSaga), fork(usersSaga)]);
}
