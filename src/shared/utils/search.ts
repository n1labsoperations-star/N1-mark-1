/**
 * A work order number in every form people type it — "1042", "WO #1042",
 * "WO1042", "WO-1042" — for list searches (matched lower-cased).
 */
export const workOrderSearchTerms = (id: string) =>
  id ? `${id} wo #${id} wo#${id} wo${id} wo-${id} wo ${id}` : '';
