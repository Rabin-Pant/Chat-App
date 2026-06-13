import apiClient from '@/lib/api.client';
import { User } from '@/types/chat.types';

export const userApi = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/users/me');
    return data.user;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await apiClient.get('/users/search', { params: { q: query } });
    return data.users;
  },

  updateProfile: async (data: { displayName?: string; avatarUrl?: string }): Promise<User> => {
    const { data: res } = await apiClient.put('/users/me', data);
    return res.user;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.user;
  },
};