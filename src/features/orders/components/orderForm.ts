import type { FormErrors } from '../../../shared/hooks';
import type { Attachment } from '../../../shared/types';
import {
  isBlank,
  isDisplayDate,
  isEmail,
  isNumeric,
  parseDisplayDate,
  toDisplayDate,
} from '../../../shared/utils';
import { COMMON_STRINGS } from '../../../shared/constants';
import { ORDER_STRINGS } from '../constants';
import type { OrderInput, OrderPriority, WorkOrder } from '../types';

/** Form state: every field is text so partial input (e.g. "12/0") survives. */
export type OrderFormValues = {
  designFile: Attachment | null;
  purchaseOrder: Attachment | null;
  customerId: string;
  customerEmail: string;
  poNumber: string;
  quantity: string;
  description: string;
  priority: OrderPriority | '';
  deliveryDate: string;
  routeCardNo: string;
  dcNo: string;
  dcDate: string;
  partNumber: string;
  drawingNumber: string;
  rmPartNumber: string;
  shopOrderNumber: string;
  rawMaterialSize: string;
  heatNumber: string;
  projectId: string;
  rawMaterialGrade: string;
};

export const EMPTY_ORDER_FORM: OrderFormValues = {
  designFile: null,
  purchaseOrder: null,
  customerId: '',
  customerEmail: '',
  poNumber: '',
  quantity: '',
  description: '',
  priority: '',
  deliveryDate: '',
  routeCardNo: '',
  dcNo: '',
  dcDate: '',
  partNumber: '',
  drawingNumber: '',
  rmPartNumber: '',
  shopOrderNumber: '',
  rawMaterialSize: '',
  heatNumber: '',
  projectId: '',
  rawMaterialGrade: '',
};

export function orderToFormValues(order?: WorkOrder): OrderFormValues {
  if (!order) {
    return EMPTY_ORDER_FORM;
  }
  return {
    designFile: order.designFile,
    purchaseOrder: order.documents[0] ?? null,
    customerId: order.customerId,
    customerEmail: order.customerEmail,
    poNumber: order.poNumber,
    quantity: order.quantity ? String(order.quantity) : '',
    description: order.description,
    priority: order.priority,
    deliveryDate: toDisplayDate(order.dueDate),
    routeCardNo: order.routeCardNo,
    dcNo: order.dcNo,
    dcDate: toDisplayDate(order.dcDate),
    partNumber: order.partNumber,
    drawingNumber: order.drawingNumber,
    rmPartNumber: order.rmPartNumber,
    shopOrderNumber: order.shopOrderNumber,
    rawMaterialSize: order.rawMaterialSize,
    heatNumber: order.heatNumber,
    projectId: order.projectId,
    rawMaterialGrade: order.rawMaterialGrade,
  };
}

/** Step 1 checks format only — every field is optional. */
export function validateOrderStep1(
  v: OrderFormValues,
): FormErrors<OrderFormValues> {
  const errors: FormErrors<OrderFormValues> = {};
  if (!isBlank(v.customerEmail) && !isEmail(v.customerEmail)) {
    errors.customerEmail = COMMON_STRINGS.invalidEmail;
  }
  if (
    !isBlank(v.quantity) &&
    (!isNumeric(v.quantity) || Number(v.quantity) < 0)
  ) {
    errors.quantity = COMMON_STRINGS.invalidNumber;
  }
  if (!isBlank(v.deliveryDate) && !isDisplayDate(v.deliveryDate)) {
    errors.deliveryDate = ORDER_STRINGS.form.invalidDate;
  }
  if (!isBlank(v.dcDate) && !isDisplayDate(v.dcDate)) {
    errors.dcDate = ORDER_STRINGS.form.invalidDate;
  }
  return errors;
}

const DEFAULT_PRIORITY: OrderPriority = 'medium';

/**
 * Form values → API input. Editing keeps the original part / job names unless
 * the description changed.
 */
export function formValuesToOrderInput(
  v: OrderFormValues,
  customerName: string,
  existing?: WorkOrder,
): OrderInput {
  const description = v.description.trim();
  const keepNames = existing && existing.description === description;
  return {
    customerId: v.customerId,
    customerName,
    customerEmail: v.customerEmail.trim(),
    partName: keepNames ? existing.partName : description.split('\n')[0],
    jobName: keepNames ? existing.jobName : '',
    description,
    material: existing?.material || v.rawMaterialGrade.trim(),
    quantity: isNumeric(v.quantity) ? Number(v.quantity) : 0,
    priority: v.priority || DEFAULT_PRIORITY,
    dueDate: parseDisplayDate(v.deliveryDate) ?? '',
    poNumber: v.poNumber.trim(),
    routeCardNo: v.routeCardNo.trim(),
    dcNo: v.dcNo.trim(),
    dcDate: parseDisplayDate(v.dcDate) ?? '',
    partNumber: v.partNumber.trim(),
    drawingNumber: v.drawingNumber.trim(),
    rmPartNumber: v.rmPartNumber.trim(),
    shopOrderNumber: v.shopOrderNumber.trim(),
    rawMaterialSize: v.rawMaterialSize.trim(),
    heatNumber: v.heatNumber.trim(),
    projectId: v.projectId.trim(),
    rawMaterialGrade: v.rawMaterialGrade.trim(),
    // Not on the admin form; set from the shop floor's Raw Material Details.
    supplier: existing?.supplier ?? '',
    notes: existing?.notes ?? '',
    designFile: v.designFile,
    // The form edits the first (purchase order) document; any others are kept.
    documents: [
      ...(v.purchaseOrder ? [v.purchaseOrder] : []),
      ...(existing?.documents.slice(1) ?? []),
    ],
  };
}
