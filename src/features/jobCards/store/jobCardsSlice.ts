import { createCrudSlice } from '../../../shared/store';
import type { JobCard } from '../types';

// Unfinished work first, then by due date.
const byStatusThenDue = (a: JobCard, b: JobCard) =>
  Number(a.status === 'completed') - Number(b.status === 'completed') ||
  a.dueDate.localeCompare(b.dueDate);

// Created whole from a work order (jobCardFromOrder); updates send a
// JobCardInput, which is a subset.
export const jobCardsCrud = createCrudSlice<JobCard, JobCard>(
  'jobCards',
  byStatusThenDue,
);

export const jobCardActions = jobCardsCrud.actions;
export default jobCardsCrud.reducer;
