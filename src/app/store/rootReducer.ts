import { combineReducers } from '@reduxjs/toolkit';

// Admin features: import the slices directly, not the feature index, so the
// store doesn't pull in screens (and an import cycle through store/hooks).
import billingReducer from '../../features/billing/store/billingSlices';
import customersReducer from '../../features/customers/store/customersSlice';
import jobCardsReducer from '../../features/jobCards/store/jobCardsSlice';
import myJobsReducer from '../../features/jobs/store/myJobsSlice';
import machinesReducer from '../../features/machines/store/machinesSlice';
import ordersReducer from '../../features/orders/store/ordersSlice';
import employeeProfileReducer from '../../features/profile/store/employeeProfileSlice';
import profileReducer from '../../features/profile/store/profileSlice';
import userManagementReducer from '../../features/userManagement/store/userManagementSlice';

const rootReducer = combineReducers({
  userManagement: userManagementReducer,
  profile: profileReducer,
  employeeProfile: employeeProfileReducer,
  customers: customersReducer,
  orders: ordersReducer,
  jobCards: jobCardsReducer,
  myJobs: myJobsReducer,
  machines: machinesReducer,
  billing: billingReducer,
});

export default rootReducer;
