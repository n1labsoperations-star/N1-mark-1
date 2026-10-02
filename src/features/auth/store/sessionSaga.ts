import type { PayloadAction } from '@reduxjs/toolkit';
import { call, takeEvery } from 'redux-saga/effects';
import type { UserRole } from '../constants';
import { saveSessionRole } from '../sessionStorage';
import { sessionActions } from './sessionSlice';

function* saveSignIn(action: PayloadAction<UserRole>) {
  yield call(saveSessionRole, action.payload);
}

function* saveSignOut() {
  yield call(saveSessionRole, null);
}

export default function* sessionSaga() {
  yield takeEvery(sessionActions.signIn.type, saveSignIn);
  yield takeEvery(sessionActions.signOut.type, saveSignOut);
}
