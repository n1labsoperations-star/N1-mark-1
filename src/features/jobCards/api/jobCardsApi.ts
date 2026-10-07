import { createMockCollection } from '../../../services/mock/mockServer';
import type { JobCard } from '../types';
import { jobCardCode, nextJobCardNumber } from '../utils';
import { MOCK_JOB_CARDS } from './mockData';

// Mock backend. Replace with apiClient calls (GET/PATCH /job-cards) later.
// Job cards are created from work orders (jobCardFromOrder) and keep the
// work order number as their id; the backend gives each the next job card
// number (JOB1, JOB2…).
const jobCards = createMockCollection<JobCard, JobCard>({
  seed: MOCK_JOB_CARDS,
  nextId: rows => jobCardCode(nextJobCardNumber(rows)),
  build: (jobCard, code) => ({ ...jobCard, code }),
});

export const jobCardsApi = {
  list: jobCards.list,
  get: jobCards.get,
  create: jobCards.create,
  update: jobCards.update,
  remove: jobCards.remove,
  reset: jobCards.reset,
};
