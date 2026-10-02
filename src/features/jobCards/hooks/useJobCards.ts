import { useCrudResource } from '../../../shared/store';
import { useAppSelector } from '../../../app/store/hooks';
import { jobCardActions } from '../store/jobCardsSlice';
import {
  selectAllJobCards,
  selectJobCardById,
  selectJobCardStats,
  selectJobCardsState,
} from '../store/selectors';

/** Job cards, load state and update. Loads on first use. */
export function useJobCards() {
  return useCrudResource(
    jobCardActions,
    selectJobCardsState,
    selectAllJobCards,
  );
}

export function useJobCard(id: string | undefined) {
  const resource = useJobCards();
  const jobCard = useAppSelector(state =>
    id ? selectJobCardById(state, id) : undefined,
  );
  return { ...resource, jobCard };
}

export const useJobCardStats = () => useAppSelector(selectJobCardStats);
