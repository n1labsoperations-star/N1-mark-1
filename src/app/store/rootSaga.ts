import { all, fork } from 'redux-saga/effects';
import { counterSaga } from '../../features/counter';
import { usersSaga } from '../../features/users';
import billingSaga from '../../features/billing/store/billingSaga';
import customersSaga from '../../features/customers/store/customersSaga';
import machinesSaga from '../../features/machines/store/machinesSaga';
import ordersSaga from '../../features/orders/store/ordersSaga';
import profileSaga from '../../features/profile/store/profileSaga';
import userManagementSaga from '../../features/userManagement/store/userManagementSaga';

export default function* rootSaga() {
  yield all([
    fork(counterSaga),
    fork(usersSaga),
    fork(userManagementSaga),
    fork(profileSaga),
    fork(customersSaga),
    fork(ordersSaga),
    fork(machinesSaga),
    fork(billingSaga),
  ]);
}
