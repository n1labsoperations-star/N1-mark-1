import { createCrudSaga } from '../../../shared/store';
import { userManagementApi } from '../api/userManagementApi';
import { userActions } from './userManagementSlice';

export const usersSaga = createCrudSaga(
  userActions,
  userManagementApi,
  'users',
);

export default usersSaga.watch;
