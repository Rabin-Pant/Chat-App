import { create } from 'zustand';

interface PresenceState {
  onlineUsers: Set<string>;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set(),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),

  setUserOffline: (userId) =>
    set((state) => {
      const updated = new Set(state.onlineUsers);
      updated.delete(userId);
      return { onlineUsers: updated };
    }),

  isOnline: (userId) => get().onlineUsers.has(userId),
}));