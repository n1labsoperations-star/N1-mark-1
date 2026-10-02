import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkOrder } from '../orders/types';
import type { QcKind } from './qc';

/** QC imports into the tab they were started from. */
type ImportParams = { qcKind?: QcKind } | undefined;

// Shop-floor job screens. The role navigator that hosts them registers these
// routes next to its tabs (My Jobs is the Jobs tab itself).
export type JobsStackParamList = {
  ScanJob: ImportParams;
  EnterJobCode: ImportParams;
  /** The work order behind a scanned or typed job code. */
  ImportOrder: { orderId: string };
  /** Mandatory raw material details; opens as a modal from the order. */
  RawMaterial: { orderId: string };
  // Reused from the Job Cards feature, under the same names.
  JobCardDetails: { jobCardId: string };
  JobCardFlow: { jobCardId: string };
  /** Machine Operator: the job they run (start, pause, complete). */
  OperatorJob: { jobCardId: string };
  /** Machine Operator: pick a machine, then start the operation. */
  AssignMachine: { jobCardId: string };
  /** QC: inspect a job, then pass or fail it. */
  QcCheck: { jobCardId: string; kind: QcKind };
  /** QC: why it failed (typed, or a voice note). */
  QcFail: { jobCardId: string; kind: QcKind };
};

export type JobsScreenProps<R extends keyof JobsStackParamList> =
  NativeStackScreenProps<JobsStackParamList, R>;

export type RawMaterialInput = Pick<
  WorkOrder,
  | 'rawMaterialGrade'
  | 'rawMaterialSize'
  | 'heatNumber'
  | 'rmPartNumber'
  | 'supplier'
>;
