import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Steps that create records elsewhere: quote → order, dispatch → invoice. */
export type WorkflowState = {
  busy: boolean;
  error: string | null;
  /** Set when a quote has been converted. */
  orderId: string | null;
  /** Set when a dispatch has been billed. */
  invoiceId: string | null;
};

const initialState: WorkflowState = {
  busy: false,
  error: null,
  orderId: null,
  invoiceId: null,
};

export type GenerateInvoicePayload = {
  jobCardId: string;
  /** The customer's quote to bill against; null for "No quote". */
  quoteId: string | null;
  /** Used without a quote: the organization's default GST rate. */
  gstRate: number;
};

const workflowSlice = createSlice({
  name: 'billing/workflow',
  initialState,
  reducers: {
    convertQuoteRequest: (state, _action: PayloadAction<string>) => {
      state.busy = true;
      state.error = null;
      state.orderId = null;
    },
    convertQuoteSuccess: (state, action: PayloadAction<string>) => {
      state.busy = false;
      state.orderId = action.payload;
    },
    generateInvoiceRequest: (
      state,
      _action: PayloadAction<GenerateInvoicePayload>,
    ) => {
      state.busy = true;
      state.error = null;
      state.invoiceId = null;
    },
    generateInvoiceSuccess: (state, action: PayloadAction<string>) => {
      state.busy = false;
      state.invoiceId = action.payload;
    },
    failure: (state, action: PayloadAction<string>) => {
      state.busy = false;
      state.error = action.payload;
    },
  },
});

export const workflowActions = workflowSlice.actions;
export default workflowSlice.reducer;
