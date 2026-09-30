import { createCrudSlice } from '../../../shared/store';
import type { Machine, MachineInput } from '../types';

const byCode = (a: Machine, b: Machine) =>
  a.code.localeCompare(b.code, undefined, { numeric: true });

export const machinesCrud = createCrudSlice<Machine, MachineInput>(
  'machines',
  byCode,
);

export const machineActions = machinesCrud.actions;
export default machinesCrud.reducer;
