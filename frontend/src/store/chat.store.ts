import { create } from 'zustand';
import { Message, UserConversation } from '@/types/chat.types';

interface ChatState {
  conversations: UserConversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  reactions: Record<string, Record<string, { count: number; userIds: string[] }>>;

  setConversations: (conversations: UserConversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, data: Partial<Message>) => void;
  removeMessage: (messageId: string, conversationId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setReactions: (messageId: string, reactions: Record<string, { count: number; userIds: string[] }>) => void;
  updateConversationLastMessage: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  reactions: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (message) =>
  set((state) => {
    const existing = state.messages[message.conversationId] || [];
    const alreadyExists = existing.find((m) => m.id === message.id);
    if (alreadyExists) return state;

    const updatedConversations = [...state.conversations];
    const convIndex = updatedConversations.findIndex(
      (c) => c.conversationId === message.conversationId
    );

    if (convIndex > 0) {
      const [conv] = updatedConversations.splice(convIndex, 1);
      updatedConversations.unshift(conv);
    }

    return {
      messages: {
        ...state.messages,
        [message.conversationId]: [...existing, message],
      },
      conversations: updatedConversations,
    };
  }),

  updateMessage: (messageId, data) =>
    set((state) => {
      const updated = { ...state.messages };
      for (const convId in updated) {
        updated[convId] = updated[convId].map((m) =>
          m.id === messageId ? { ...m, ...data } : m
        );
      }
      return { messages: updated };
    }),

  removeMessage: (messageId, conversationId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: updated },
      };
    }),

  setReactions: (messageId, reactions) =>
    set((state) => ({
      reactions: { ...state.reactions, [messageId]: reactions },
    })),

  updateConversationLastMessage: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId
          ? { ...c, conversation: { ...c.conversation, updatedAt: new Date().toISOString() } }
          : c
      ),
    })),
}));