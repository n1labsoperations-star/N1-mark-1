import { all, fork } from 'redux-saga/effects';

import sessionSaga from '../../features/auth/store/sessionSaga';
import billingSaga from '../../features/billing/store/billingSaga';
import customersSaga from '../../features/customers/store/customersSaga';
import jobCardsSaga from '../../features/jobCards/store/jobCardsSaga';
import myJobsSaga from '../../features/jobs/store/myJobsSaga';
import machinesSaga from '../../features/machines/store/machinesSaga';
import ordersSaga from '../../features/orders/store/ordersSaga';
import employeeProfileSaga from '../../features/profile/store/employeeProfileSaga';
import profileSaga from '../../features/profile/store/profileSaga';
import userManagementSaga from '../../features/userManagement/store/userManagementSaga';

export default function* rootSaga() {
  yield all([
    fork(sessionSaga),
    fork(userManagementSaga),
    fork(profileSaga),
    fork(employeeProfileSaga),
    fork(customersSaga),
    fork(ordersSaga),
    fork(jobCardsSaga),
    fork(myJobsSaga),
    fork(machinesSaga),
    fork(billingSaga),
  ]);
}
