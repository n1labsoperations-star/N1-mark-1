import { isBlank } from '../../shared/utils';
import type { WorkOrder } from '../orders/types';
import { jobCardStage } from '../jobCards/utils';
import type { JobCard } from '../jobCards/types';
import type { EmployeeRole } from '../profile/types';
import type { OrderView, RawMaterialInput } from './types';

/** The job view of a work order, from its job card (operator, QC). */
export const jobViewOf = (c: JobCard): OrderView => ({
  id: c.orderId,
  number: c.number,
  customerName: c.customerName,
  partName: c.partName,
  jobName: c.jobName,
  description: '',
  priority: c.priority,
  dueDate: c.dueDate,
  quantity: c.quantity,
  partNumber: c.partNumber ?? '',
  drawingNumber: c.drawingNumber ?? '',
  poNumber: c.poNumber ?? '',
  routeCardNo: c.routeCardNo ?? '',
  materialSource: c.materialSource,
  designFile: c.designFile,
});

export const rawMaterialOf = (order: WorkOrder): RawMaterialInput => ({
  rawMaterialGrade: order.rawMaterialGrade,
  rawMaterialSize: order.rawMaterialSize,
  heatNumber: order.heatNumber,
  rmPartNumber: order.rmPartNumber,
  materialSource: order.materialSource,
});

/** True when any raw material detail needed for a job card is blank. */
export const isRawMaterialMissing = (order: WorkOrder) =>
  Object.values(rawMaterialOf(order)).some(isBlank);

/**
 * Operator: their part of the job is over, so it leaves My Jobs. Either the
 * whole card is completed, or every step assigned to them is. A card with
 * none of their steps yet (just scanned) stays.
 */
export function isOperatorDone(c: JobCard, operatorId: string): boolean {
  if (c.status === 'completed') {
    return true;
  }
  const mine = c.operations.filter(
    op => operatorId && op.operatorId === operatorId,
  );
  return mine.length > 0 && mine.every(op => op.status === 'completed');
}

/**
 * Whether a job leaves the role's My Jobs: an operator's once their part is
 * over, a supervisor's once it's dispatched and invoiced (Done).
 */
export function isOffMyJobs(
  c: JobCard,
  role: EmployeeRole,
  operatorId: string,
): boolean {
  if (role === 'operator') {
    return isOperatorDone(c, operatorId);
  }
  return role === 'supervisor' && jobCardStage(c).key === 'done';
}
