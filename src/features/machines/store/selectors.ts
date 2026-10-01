import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { machinesCrud } from './machinesSlice';

export const selectMachinesState = (state: RootState) => state.machines;

export const { selectAll: selectAllMachines } =
  machinesCrud.adapter.getSelectors(selectMachinesState);

export const selectMachineStats = createSelector(
  [selectAllMachines],
  machines => ({
    total: machines.length,
    running: machines.filter(m => m.status === 'running').length,
    idle: machines.filter(m => m.status === 'idle').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
  }),
);
