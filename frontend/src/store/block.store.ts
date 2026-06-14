import { create } from 'zustand';

interface BlockState {
  blockedUserIds: string[];
  setBlockedUsers: (ids: string[]) => void;
  addBlock: (userId: string) => void;
  removeBlock: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
}

export const useBlockStore = create<BlockState>((set, get) => ({
  blockedUserIds: [],

  setBlockedUsers: (ids) => set({ blockedUserIds: ids }),

  addBlock: (userId) =>
    set((state) => ({
      blockedUserIds: [...state.blockedUserIds, userId],
    })),

  removeBlock: (userId) =>
    set((state) => ({
      blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
    })),

  isBlocked: (userId) => get().blockedUserIds.includes(userId),
}));