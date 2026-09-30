import { createCrudSaga } from '../../../shared/store';
import { ordersApi } from '../api/ordersApi';
import { orderActions } from './ordersSlice';

export const ordersSaga = createCrudSaga(orderActions, ordersApi, 'orders');

export default ordersSaga.watch;
