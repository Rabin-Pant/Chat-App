import apiClient from '@/lib/api.client';
import { Message, UserConversation, Conversation } from '@/types/chat.types';

export const messageApi = {
  getConversations: async (): Promise<UserConversation[]> => {
    const { data } = await apiClient.get('/chat/conversations');
    return data.conversations;
  },

  startDM: async (userId: string): Promise<Conversation> => {
    const { data } = await apiClient.post(`/chat/conversations/dm/${userId}`);
    return data.conversation;
  },

  getMessages: async (
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> => {
    const params: any = { limit };
    if (before) params.before = before;
    const { data } = await apiClient.get(
      `/chat/conversations/${conversationId}/messages`,
      { params }
    );
    return data.messages;
  },

  sendMessage: async (
  conversationId: string,
  content: string,
  replyToId?: string
): Promise<Message> => {
  const { data } = await apiClient.post(
    `/chat/conversations/${conversationId}/messages`,
    { content, replyToId }
  );
  return data.message;
},

  softDelete: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}/soft`);
  },

  hardDelete: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}/hard`);
  },

  unsend: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}/unsend`);
  },

  clearConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/chat/conversations/${conversationId}/clear`);
  },
};