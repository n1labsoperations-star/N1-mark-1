import { createMockCollection } from '../../../services/mock/mockServer';
import type { JobCard } from '../types';
import { MOCK_JOB_CARDS } from './mockData';

// Mock backend. Replace with apiClient calls (GET/PATCH /job-cards) later.
// Job cards are created from work orders (jobCardFromOrder) and keep the
// work order number as their id.
const jobCards = createMockCollection<JobCard, JobCard>({
  seed: MOCK_JOB_CARDS,
  nextId: rows => String(rows.length + 1),
  build: jobCard => jobCard,
});

export const jobCardsApi = {
  list: jobCards.list,
  get: jobCards.get,
  create: jobCards.create,
  update: jobCards.update,
  remove: jobCards.remove,
  reset: jobCards.reset,
};
