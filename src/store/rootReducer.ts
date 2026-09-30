import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import usersReducer from '../features/users/usersSlice';
import profileReducer from '../features/profile/store/profileSlice';
import customersReducer from '../features/customers/store/customersSlice';
import ordersReducer from '../features/orders/store/ordersSlice';
import machinesReducer from '../features/machines/store/machinesSlice';
import billingReducer from '../features/billing/store/billingSlices';
import userManagementReducer from '../features/userManagement/store/userManagementSlice';

const rootReducer = combineReducers({
  counter: counterReducer,
  users: usersReducer,
  userManagement: userManagementReducer,
  profile: profileReducer,
  customers: customersReducer,
  orders: ordersReducer,
  machines: machinesReducer,
  billing: billingReducer,
});

export default rootReducer;
