import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import usersReducer from '../features/users/usersSlice';

const rootReducer = combineReducers({
  counter: counterReducer,
  users: usersReducer,
});

export default rootReducer;
