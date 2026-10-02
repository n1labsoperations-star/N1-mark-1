import { createMockCollection } from '../../../services/mock/mockServer';
import type { JobCard, JobCardInput } from '../types';
import { MOCK_JOB_CARDS } from './mockData';

// Mock backend. Replace with apiClient calls (GET/PATCH /job-cards) later.
// Job cards are opened from work orders, so the screens only update them.
const jobCards = createMockCollection<JobCard, JobCardInput>({
  seed: MOCK_JOB_CARDS,
  nextId: rows => String(rows.length + 1),
  build: () => {
    throw new Error('Job cards are created from work orders');
  },
});

export const jobCardsApi = {
  list: jobCards.list,
  create: jobCards.create,
  update: jobCards.update,
  remove: jobCards.remove,
  reset: jobCards.reset,
};
