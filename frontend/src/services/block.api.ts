import apiClient from '@/lib/api.client';

export const blockApi = {
  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/blocks/${userId}`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/blocks/${userId}`);
  },

  isBlocked: async (userId: string): Promise<boolean> => {
    const { data } = await apiClient.get(`/blocks/${userId}`);
    return data.isBlocked;
  },

  getBlockedUsers: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/blocks');
    return data.blocked;
  },
};