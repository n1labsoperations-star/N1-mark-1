import { isBlank } from '../../shared/utils';
import type { WorkOrder } from '../orders/types';
import type { RawMaterialInput } from './types';

/**
 * Work order id from a typed or scanned job code: "WO-01042", "WO #1042" and
 * "1042" all give "1042". Empty when there are no digits.
 */
export function parseJobCode(code: string): string {
  // An order's QR code lists its details under the WO number; read only that.
  const [first = ''] = code.trim().split('\n');
  return first.replace(/\D/g, '').replace(/^0+/, '');
}

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
