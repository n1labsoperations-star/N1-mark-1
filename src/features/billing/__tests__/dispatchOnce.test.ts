import { runSaga } from 'redux-saga';
import { ordersApi } from '../../orders/api/ordersApi';
import type { WorkOrder } from '../../orders/types';
import { dispatchOnce } from '../store/workflowSaga';

jest.mock('../../orders/api/ordersApi', () => ({
  ordersApi: { dispatch: jest.fn(), get: jest.fn() },
}));

const api = ordersApi as jest.Mocked<typeof ordersApi>;
const order = (status: WorkOrder['status']) =>
  ({ id: 'o1', status } as WorkOrder);
const refused = new Error(
  'The order cannot move to that status from where it is now.',
);

const run = () =>
  runSaga(
    { dispatch: () => undefined },
    dispatchOnce as (...args: unknown[]) => Generator,
    'o1',
  ).toPromise();

afterEach(() => jest.resetAllMocks());

test('dispatches the order', async () => {
  api.dispatch.mockResolvedValue(order('payment_due'));
  await expect(run()).resolves.toMatchObject({ status: 'payment_due' });
  expect(api.get).not.toHaveBeenCalled();
});

test('an order an earlier try dispatched goes on to its invoice', async () => {
  api.dispatch.mockRejectedValue(refused);
  api.get.mockResolvedValue(order('payment_due'));
  await expect(run()).resolves.toMatchObject({ status: 'payment_due' });
});

test('any other refusal stands', async () => {
  api.dispatch.mockRejectedValue(refused);
  api.get.mockResolvedValue(order('in_progress'));
  await expect(run()).rejects.toBe(refused);
});
