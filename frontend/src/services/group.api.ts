import apiClient from '@/lib/api.client';
import { Group } from '@/types/chat.types';

export const groupApi = {
  createGroup: async (
    name: string,
    memberIds: string[],
    description?: string
  ): Promise<Group> => {
    const { data } = await apiClient.post('/groups', { name, memberIds, description });
    return data.group;
  },

  getGroup: async (groupId: string): Promise<Group> => {
    const { data } = await apiClient.get(`/groups/${groupId}`);
    return data.group;
  },

  updateGroup: async (
    groupId: string,
    data: { name?: string; avatarUrl?: string; description?: string }
  ): Promise<Group> => {
    const { data: res } = await apiClient.put(`/groups/${groupId}`, data);
    return res.group;
  },

  addMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.post(`/groups/${groupId}/members/${userId}`);
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },

  getMembers: async (groupId: string) => {
    const { data } = await apiClient.get(`/groups/${groupId}/members`);
    return data.members;
  },
};