import { createCrudSaga } from '../../../shared/store';
import { machinesApi } from '../api/machinesApi';
import { machineActions } from './machinesSlice';

export const machinesSaga = createCrudSaga(
  machineActions,
  machinesApi,
  'machines',
);

export default machinesSaga.watch;
