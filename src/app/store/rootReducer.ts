import { combineReducers } from '@reduxjs/toolkit';
import { counterReducer } from '../../features/counter';
import { usersReducer } from '../../features/users';

const rootReducer = combineReducers({
  counter: counterReducer,
  users: usersReducer,
});

export default rootReducer;
