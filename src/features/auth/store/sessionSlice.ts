import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '../constants';
import { loadSessionRole } from '../sessionStorage';

export type SessionState = {
  /** Who is signed in; null shows the login screens. */
  role: UserRole | null;
};

const sessionSlice = createSlice({
  name: 'session',
  // Lazy, so each store reads the saved session when it is created.
  initialState: (): SessionState => ({ role: loadSessionRole() }),
  reducers: {
    signIn: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    signOut: state => {
      state.role = null;
    },
  },
});

export const sessionActions = sessionSlice.actions;
export default sessionSlice.reducer;
