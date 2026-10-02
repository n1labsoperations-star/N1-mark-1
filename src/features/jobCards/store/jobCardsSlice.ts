import { createCrudSlice } from '../../../shared/store';
import type { JobCard, JobCardInput } from '../types';

// Unfinished work first, then by due date.
const byStatusThenDue = (a: JobCard, b: JobCard) =>
  Number(a.status === 'completed') - Number(b.status === 'completed') ||
  a.dueDate.localeCompare(b.dueDate);

export const jobCardsCrud = createCrudSlice<JobCard, JobCardInput>(
  'jobCards',
  byStatusThenDue,
);

export const jobCardActions = jobCardsCrud.actions;
export default jobCardsCrud.reducer;
