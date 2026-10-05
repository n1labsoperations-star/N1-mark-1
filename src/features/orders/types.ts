import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type { AdminDrawerParamList } from '../dashboard/types';
import type {
  ActivityEntry,
  Attachment,
  ISODateString,
} from '../../shared/types';

/** Where the raw material comes from. */
export type MaterialSource = 'bought_out' | 'in_house';
export type OrderPriority = 'high' | 'medium' | 'low';
export type OrderStatus = 'new' | 'in_progress' | 'qc_pending' | 'completed';

export type WorkOrder = {
  /** Work order number, e.g. "1042" (shown as "WO #1042"). */
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  partName: string;
  /** e.g. "Job A". */
  jobName: string;
  description: string;
  material: string;
  quantity: number;
  priority: OrderPriority;
  status: OrderStatus;
  dueDate: ISODateString;
  poNumber: string;
  routeCardNo: string;
  dcNo: string;
  dcDate: ISODateString;
  partNumber: string;
  drawingNumber: string;
  rmPartNumber: string;
  shopOrderNumber: string;
  rawMaterialSize: string;
  heatNumber: string;
  projectId: string;
  rawMaterialGrade: string;
  /** Bought out or made in-house; set when the job card is created. */
  materialSource: MaterialSource | '';
  /** The quote this order was converted from; blank when created directly. */
  quoteId: string;
  notes: string;
  designFile: Attachment | null;
  documents: Attachment[];
  statusHistory: ActivityEntry[];
  createdAt: ISODateString;
};

/** Everything the Create / Edit order form can set. All optional in the UI. */
export type OrderInput = Omit<
  WorkOrder,
  'id' | 'status' | 'statusHistory' | 'createdAt'
>;

/** Multi-select filters; an empty list shows every order. */
export type OrderFilters = {
  priority: OrderPriority[];
  status: OrderStatus[];
};

// Stack nested inside the admin drawer's "Orders" item.
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: {
    orderId: string;
    /** Opened from this customer's details: Back returns there. */
    fromCustomerId?: string;
  };
  /** Without an id the form creates a new order. */
  OrderForm:
    | {
        orderId?: string;
        /** Edit opened from the order's details: Back and Save return there. */
        from?: 'details';
      }
    | undefined;
};

export type OrdersNavigation = NativeStackNavigationProp<OrdersStackParamList>;

/** Screen props that can also reach the other admin drawer items. */
export type OrdersScreenProps<R extends keyof OrdersStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<OrdersStackParamList, R>,
    DrawerScreenProps<AdminDrawerParamList>
  >;
