import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

export type UsersState = {
  items: User[];
  isLoading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  items: [],
  isLoading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Request/success/failure trio driven by usersSaga.
    fetchUsersRequest: state => {
      state.isLoading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure } =
  usersSlice.actions;
export default usersSlice.reducer;
