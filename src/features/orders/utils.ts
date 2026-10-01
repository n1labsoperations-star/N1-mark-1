import { matchesOption } from '../../shared/hooks';
import { ORDER_STRINGS, PRIORITY_META } from './constants';
import type { OrderFilters, WorkOrder } from './types';

/** "Bracket — Job A"; falls back to the description for new orders. */
export function orderTitle(
  o: Pick<WorkOrder, 'partName' | 'jobName' | 'description'>,
): string {
  const title = [o.partName, o.jobName].filter(Boolean).join(' — ');
  return title || o.description.split('\n')[0] || '';
}

/** "WO #1042 · Bracket — Job A" */
export const orderHeading = (o: WorkOrder) =>
  [ORDER_STRINGS.workOrder(o.id), orderTitle(o)].filter(Boolean).join(' · ');

/** "MS Round Bar · 200 pcs" */
export const materialLine = (o: WorkOrder) =>
  [
    o.material || o.rawMaterialGrade,
    o.quantity ? ORDER_STRINGS.quantity(o.quantity) : '',
  ]
    .filter(Boolean)
    .join(' · ');

/** High before medium before low; then earliest due date; undated last. */
export function compareOrders(a: WorkOrder, b: WorkOrder): number {
  const byPriority =
    PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
  if (byPriority !== 0) {
    return byPriority;
  }
  if (a.dueDate && b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate);
  }
  return a.dueDate ? -1 : b.dueDate ? 1 : b.id.localeCompare(a.id);
}

export const orderSearchText = (o: WorkOrder) =>
  `${o.id} ${o.partName} ${o.jobName} ${o.customerName} ${o.material} ${o.poNumber} ${o.description}`;

export const matchesOrderFilters = (o: WorkOrder, f: OrderFilters) =>
  matchesOption(f.priority, o.priority) && matchesOption(f.status, o.status);

export const INITIAL_ORDER_FILTERS: OrderFilters = {
  priority: 'all',
  status: 'all',
};

export const isOpen = (o: WorkOrder) => o.status !== 'completed';
