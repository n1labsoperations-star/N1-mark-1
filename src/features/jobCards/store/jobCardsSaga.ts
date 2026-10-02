import { createCrudSaga } from '../../../shared/store';
import { jobCardsApi } from '../api/jobCardsApi';
import { jobCardActions } from './jobCardsSlice';

export const jobCardsSaga = createCrudSaga(
  jobCardActions,
  jobCardsApi,
  'job cards',
);

export default jobCardsSaga.watch;
