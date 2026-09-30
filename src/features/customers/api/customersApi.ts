import {
  createMockCollection,
  nextSequentialId,
} from '../../../services/mock/mockServer';
import type { Customer, CustomerInput } from '../types';
import { MOCK_CUSTOMERS } from './mockData';

// Mock backend. Replace with apiClient calls (GET/POST/PATCH/DELETE /customers) later.
const customers = createMockCollection<Customer, CustomerInput>({
  seed: MOCK_CUSTOMERS,
  nextId: rows => nextSequentialId(rows, 'CUS-'),
  build: (input, id) => {
    const now = new Date().toISOString();
    return {
      ...input,
      id,
      currentProjects: 0,
      previousProjects: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      customerSince: now,
      activity: [
        { id: 'a1', label: 'Account added', at: now, tone: 'neutral' },
      ],
    };
  },
});

export const customersApi = {
  list: customers.list,
  create: customers.create,
  update: customers.update,
  remove: customers.remove,
  reset: customers.reset,
};
