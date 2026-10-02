import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { MockNotFoundError } from '../../../services/mock/mockServer';
import { errorMessage } from '../../../shared/store';
import { jobCardsApi } from '../../jobCards/api/jobCardsApi';
import { jobCardActions } from '../../jobCards/store/jobCardsSlice';
import type { JobCard } from '../../jobCards/types';
import { jobCardFromOrder } from '../../jobCards/utils';
import { ordersApi } from '../../orders/api/ordersApi';
import { orderActions } from '../../orders/store/ordersSlice';
import type { WorkOrder } from '../../orders/types';
import type { EmployeeRole } from '../../profile/types';
import { myJobsApi } from '../api/myJobsApi';
import { myJobsActions, type ImportJobPayload } from './myJobsSlice';

export function* fetchMyJobs(action: PayloadAction<EmployeeRole>) {
  try {
    const ids: string[] = yield call(myJobsApi.list, action.payload);
    yield put(myJobsActions.fetchSuccess(ids));
  } catch (error) {
    yield put(
      myJobsActions.fetchFailure(errorMessage(error, 'Failed to load jobs')),
    );
  }
}

/** The order's job card, created from the order when it has none yet. */
function* ensureJobCard(order: WorkOrder) {
  try {
    const existing: JobCard = yield call(jobCardsApi.get, order.id);
    return existing;
  } catch (error) {
    if (!(error instanceof MockNotFoundError)) {
      throw error;
    }
    const created: JobCard = yield call(
      jobCardsApi.create,
      jobCardFromOrder(order),
    );
    return created;
  }
}

export function* importJob(action: PayloadAction<ImportJobPayload>) {
  try {
    const { role, orderId, rawMaterial } = action.payload;
    if (rawMaterial) {
      const order: WorkOrder = yield call(
        ordersApi.update,
        orderId,
        rawMaterial,
      );
      yield put(orderActions.saveSuccess(order));
      const jobCard: JobCard = yield call(ensureJobCard, order);
      yield put(jobCardActions.saveSuccess(jobCard));
    }
    const ids: string[] = yield call(myJobsApi.add, role, orderId);
    yield put(myJobsActions.importSuccess(ids));
  } catch (error) {
    yield put(
      myJobsActions.importFailure(
        errorMessage(error, 'Failed to create the job card'),
      ),
    );
  }
}

export default function* myJobsSaga() {
  yield takeLatest(myJobsActions.fetchRequest.type, fetchMyJobs);
  yield takeLatest(myJobsActions.importRequest.type, importJob);
}
