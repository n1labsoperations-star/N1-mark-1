import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RequestStatus } from '../../../shared/types';
import type { EmployeeRole } from '../../profile/types';
import type { RawMaterialInput } from '../types';

export type MyJobsState = {
  /** Whose list is loaded; another role signing in reloads it. */
  role: EmployeeRole | null;
  /** Work order numbers on the list, newest import first. */
  ids: string[];
  status: RequestStatus;
  error: string | null;
  importing: boolean;
  importError: string | null;
};

const initialState: MyJobsState = {
  role: null,
  ids: [],
  status: 'idle',
  error: null,
  importing: false,
  importError: null,
};

export type ImportJobPayload = {
  role: EmployeeRole;
  orderId: string;
  /** Second Admin only: saved to the order, and the job card is created. */
  rawMaterial?: RawMaterialInput;
};

const myJobsSlice = createSlice({
  name: 'myJobs',
  initialState,
  reducers: {
    fetchRequest: (state, action: PayloadAction<EmployeeRole>) => {
      state.role = action.payload;
      state.status = 'loading';
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
      state.status = 'succeeded';
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    /** Adds a job to the list (Second Admin: saves raw material and creates the job card first). */
    importRequest: (state, _action: PayloadAction<ImportJobPayload>) => {
      state.importing = true;
      state.importError = null;
    },
    importSuccess: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
      state.importing = false;
    },
    importFailure: (state, action: PayloadAction<string>) => {
      state.importing = false;
      state.importError = action.payload;
    },
  },
});

export const myJobsActions = myJobsSlice.actions;
export default myJobsSlice.reducer;
