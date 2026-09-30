import { apiClient } from '../../../services/api';
import type { User } from '../types';

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
}
