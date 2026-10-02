import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { jobCardsCrud } from './jobCardsSlice';

export const selectJobCardsState = (state: RootState) => state.jobCards;

export const { selectAll: selectAllJobCards, selectById: selectJobCardById } =
  jobCardsCrud.adapter.getSelectors(selectJobCardsState);

export const selectJobCardStats = createSelector([selectAllJobCards], cards => {
  const completed = cards.filter(c => c.status === 'completed').length;
  return { active: cards.length - completed, completed };
});
