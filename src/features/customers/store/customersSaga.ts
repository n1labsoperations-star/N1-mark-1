import { createCrudSaga } from '../../../shared/store';
import { customersApi } from '../api/customersApi';
import { customerActions } from './customersSlice';

export const customersSaga = createCrudSaga(
  customerActions,
  customersApi,
  'customers',
);

export default customersSaga.watch;
