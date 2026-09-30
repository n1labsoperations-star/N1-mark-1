import {
  createMockCollection,
  nextSequentialId,
} from '../../../services/mock/mockServer';
import type { Machine, MachineInput } from '../types';
import { MOCK_MACHINES } from './mockData';

// Mock backend. Replace with apiClient calls (GET/POST/PATCH /machines) later.
const machines = createMockCollection<Machine, MachineInput>({
  seed: MOCK_MACHINES,
  nextId: rows => nextSequentialId(rows, 'MCH-'),
  build: (input, id) => ({ ...input, id, currentWork: null }),
});

export const machinesApi = {
  list: machines.list,
  create: machines.create,
  update: machines.update,
  remove: machines.remove,
  reset: machines.reset,
};
