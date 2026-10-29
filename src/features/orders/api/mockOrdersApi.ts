import { ApiError } from '../../../services/api';
import {
  createMockCollection,
  nextSequentialId,
} from '../../../services/mock/mockServer';
import { invoicesApi } from '../../billing/api/mockBillingApi';
import { jobReference } from '../../billing/workflow';
import { jobCardsApi } from '../../jobCards/api/mockJobCardsApi';
import type { JobCard } from '../../jobCards/types';
import { jobCardFromOrder } from '../../jobCards/utils';
import type { OrderInput, WorkOrder } from '../types';
import { isWorkOrder, orderStatus } from '../utils';
import { MOCK_ORDERS } from './mockData';

// In-memory stand-in for ordersApi (Jest and offline work). Like the server,
// an order's job card opens with updateOrder(openJobCard), and an order's
// status follows its job card and invoice.
const orders = createMockCollection<WorkOrder, OrderInput>({
  seed: MOCK_ORDERS,
  nextId: rows => nextSequentialId(rows, ''),
  build: ({ openJobCard: _openJobCard, ...input }, id) => {
    const now = new Date().toISOString();
    return {
      ...input,
      id,
      number: id,
      jobCardId: '',
      canCreateJobCard: true,
      status: 'new',
      createdAt: now,
      statusHistory: [
        { id: 'h1', label: 'Order created', at: now, tone: 'neutral' },
      ],
    };
  },
});

/** The orders with the status the server would report. */
async function withStatus(rows: WorkOrder[]): Promise<WorkOrder[]> {
  const [cards, invoices] = await Promise.all([
    jobCardsApi.list(),
    invoicesApi.list(),
  ]);
  const byOrder = new Map<string, JobCard>(cards.map(c => [c.orderId, c]));
  const paid = new Set(
    invoices.filter(i => i.status === 'paid').map(i => i.jobId),
  );
  return rows.map(o => {
    const card = byOrder.get(o.id);
    const jobCardId = o.jobCardId || (card?.id ?? '');
    return {
      ...o,
      jobCardId,
      canCreateJobCard: !jobCardId && o.status !== 'completed',
      status: orderStatus(o, card, paid.has(jobReference(o.id))),
    };
  });
}

const one = async (order: WorkOrder) => (await withStatus([order]))[0];

export const ordersApi = {
  list: async () => withStatus(await orders.list()),
  get: async (id: string) => one(await orders.get(id)),
  findByNumber: async (code: string) => {
    const order = (await orders.list()).find(o => isWorkOrder(o, code));
    if (!order) {
      throw new ApiError('That order does not exist.', 404, undefined, {
        code: 'ORDER_NOT_FOUND',
      });
    }
    return one(order);
  },
  create: async (input: OrderInput) => one(await orders.create(input)),
  update: async (
    id: string,
    { openJobCard, ...changes }: Partial<OrderInput>,
  ) => {
    const order = await orders.update(id, changes);
    if (openJobCard && !(await one(order)).jobCardId) {
      await jobCardsApi.create(jobCardFromOrder(order));
    }
    return one(order);
  },
  /** The status follows the card and invoice; dispatch just reads it. */
  dispatch: async (id: string) => one(await orders.get(id)),
  remove: orders.remove,
  reset: orders.reset,
};
