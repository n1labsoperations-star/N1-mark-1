import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CounterState = {
  value: number;
  isPending: boolean;
};

const initialState: CounterState = {
  value: 0,
  isPending: false,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: state => {
      state.value += 1;
    },
    decrement: state => {
      state.value -= 1;
    },
    // Handled by counterSaga, which dispatches incrementBy after a delay.
    incrementAsync: state => {
      state.isPending = true;
    },
    incrementBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.isPending = false;
    },
  },
});

export const { increment, decrement, incrementAsync, incrementBy } =
  counterSlice.actions;
export default counterSlice.reducer;
