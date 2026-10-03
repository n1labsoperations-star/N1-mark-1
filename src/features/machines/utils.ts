import { matchesAny } from '../../shared/hooks';
import { workOrderSearchTerms } from '../../shared/utils';
import { MACHINE_TYPE_LABELS } from './constants';
import type { Machine, MachineFilters } from './types';

/** What the list's search box looks through. */
export const machineSearchText = (m: Machine) =>
  `${m.code} ${m.name} ${m.model} ${MACHINE_TYPE_LABELS[m.type]} ${
    m.location
  } ${workOrderSearchTerms(m.currentWork?.workOrderId ?? '')} ${
    m.currentWork?.operator ?? ''
  }`;

export const matchesMachineFilters = (m: Machine, f: MachineFilters) =>
  matchesAny(f.status, m.status);

export const INITIAL_MACHINE_FILTERS: MachineFilters = { status: [] };
