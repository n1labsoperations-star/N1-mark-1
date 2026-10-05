import { useCrudResource } from '../../../shared/store';
import { useAppSelector } from '../../../app/store/hooks';
import { machineActions } from '../store/machinesSlice';
import {
  selectAllMachines,
  selectMachineById,
  selectMachineStats,
  selectMachinesState,
} from '../store/selectors';

/** Machines, load state and create / update. Loads on first use. */
export function useMachines() {
  return useCrudResource(
    machineActions,
    selectMachinesState,
    selectAllMachines,
  );
}

export function useMachine(id: string) {
  const resource = useMachines();
  const machine = useAppSelector(state => selectMachineById(state, id));
  return { ...resource, machine };
}

export const useMachineStats = () => useAppSelector(selectMachineStats);
