import { useCrudResource } from '../../../shared/store';
import { useAppSelector } from '../../../store/hooks';
import {
  selectAllUsers,
  selectUserById,
  selectUsersState,
} from '../store/selectors';
import { userActions } from '../store/userManagementSlice';

/** Users list, load state and create / update / delete. Loads on first use. */
export function useUsers() {
  return useCrudResource(userActions, selectUsersState, selectAllUsers);
}

export function useUser(id: string) {
  const resource = useUsers();
  const user = useAppSelector(state => selectUserById(state, id));
  return { ...resource, user };
}
