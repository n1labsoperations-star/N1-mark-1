export type MachineType =
  | 'cnc_lathe'
  | 'cnc_mill'
  | 'lathe'
  | 'welding'
  | 'inspection'
  | 'packing';
export type MachineStatus = 'running' | 'idle' | 'maintenance';

/** The job a machine is working on, as the shop-floor API reports it. */
export type MachineWork = {
  workOrderId: string;
  title: string;
  operator: string;
};

export type Machine = {
  id: string;
  code: string;
  name: string;
  model: string;
  type: MachineType;
  location: string;
  status: MachineStatus;
  currentWork: MachineWork | null;
  notes: string;
};

export type MachineInput = Pick<
  Machine,
  'name' | 'code' | 'model' | 'type' | 'location' | 'status' | 'notes'
>;
