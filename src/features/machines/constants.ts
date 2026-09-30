import type { N1DropDownOption } from '../../N1Modules';
import type { StatusMeta } from '../../shared/types';
import type { MachineStatus, MachineType } from './types';

export const MACHINE_STRINGS = {
  title: 'Machines',
  subtitle: (org: string) => `Every machine on the shop floor at ${org}.`,
  add: 'Add Machine',
  addA11y: 'Add machine',
  noun: 'machines',
  stats: {
    total: 'Total machines',
    running: 'Running',
    idle: 'Idle',
    maintenance: 'Under maintenance',
    maintenanceShort: 'Maintenance',
  },
  columns: {
    code: 'Code',
    name: 'Machine name',
    type: 'Type',
    location: 'Location',
    work: 'Current work',
    status: 'Status',
    actions: 'Actions',
  },
  workOrder: (id: string) => `WO #${id}`,
  edit: 'Edit',
  form: {
    addTitle: 'Add machine',
    addSubtitle: 'Register a new machine on the shop floor.',
    editTitle: 'Edit machine',
    editSubtitle: (name: string) => `Update ${name}'s details.`,
    submitAdd: 'Add machine',
    name: 'Machine Name',
    namePlaceholder: 'e.g. Turning Center 3',
    code: 'Machine Code',
    codePlaceholder: 'e.g. CNC-05',
    codeTaken: 'Another machine already uses this code',
    model: 'Model',
    modelPlaceholder: 'e.g. Haas ST-20',
    type: 'Machine Type',
    location: 'Location / Bay',
    locationPlaceholder: 'e.g. Bay 1',
    status: 'Status',
    notes: 'Notes',
    notesPlaceholder: 'Any additional details',
  },
  a11y: { edit: (name: string) => `Edit ${name}` },
} as const;

export const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  cnc_lathe: 'CNC Lathe',
  cnc_mill: 'CNC Mill',
  lathe: 'Lathe',
  welding: 'Welding',
  inspection: 'Inspection',
  packing: 'Packing',
};

export const MACHINE_STATUS_META: Record<MachineStatus, StatusMeta> = {
  running: { label: 'Running', tone: 'info' },
  idle: { label: 'Idle', tone: 'neutral' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
};

export const MACHINE_TYPE_OPTIONS: N1DropDownOption<MachineType>[] = (
  Object.keys(MACHINE_TYPE_LABELS) as MachineType[]
).map(value => ({ value, label: MACHINE_TYPE_LABELS[value] }));

export const MACHINE_STATUS_OPTIONS: N1DropDownOption<MachineStatus>[] = (
  Object.keys(MACHINE_STATUS_META) as MachineStatus[]
).map(value => ({ value, label: MACHINE_STATUS_META[value].label }));
