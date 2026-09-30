import {
  createMockCollection,
  nextSequentialId,
} from '../../../services/mock/mockServer';
import type { OrderInput, WorkOrder } from '../types';
import { MOCK_ORDERS } from './mockData';

// Mock backend. Replace with apiClient calls (GET/POST/PATCH /orders) later.
const orders = createMockCollection<WorkOrder, OrderInput>({
  seed: MOCK_ORDERS,
  nextId: rows => nextSequentialId(rows, ''),
  build: (input, id) => {
    const now = new Date().toISOString();
    return {
      ...input,
      id,
      status: 'new',
      createdAt: now,
      statusHistory: [
        { id: 'h1', label: 'Order created', at: now, tone: 'neutral' },
      ],
    };
  },
});

export const ordersApi = {
  list: orders.list,
  create: orders.create,
  update: orders.update,
  remove: orders.remove,
  reset: orders.reset,
};
