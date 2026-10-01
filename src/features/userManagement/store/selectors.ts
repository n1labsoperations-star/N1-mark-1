import type { RootState } from '../../../app/store';
import { usersCrud } from './userManagementSlice';

export const selectUsersState = (state: RootState) => state.userManagement;

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersCrud.adapter.getSelectors(selectUsersState);
