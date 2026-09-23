import apiClient from './apiClient';

export type User = {
  id: number;
  name: string;
};

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
}
