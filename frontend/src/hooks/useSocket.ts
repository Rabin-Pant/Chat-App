import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chat.store';
import { useNotificationStore } from '@/store/notification.store';
import { usePresenceStore } from '@/store/presence.store';
import { messageApi } from '@/services/message.api';

export const useSocket = (isAuthenticated: boolean) => {
  const { setTyping, setReactions, addMessage, setConversations } = useChatStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const { setUserOnline, setUserOffline } = usePresenceStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    socket.on('message:receive', async (message: any) => {
      const { activeConversationId, conversations } = useChatStore.getState();

      if (message.conversationId === activeConversationId) {
        const updated = [...conversations];
        const idx = updated.findIndex(
          (c) => c.conversationId === message.conversationId
        );
        if (idx > 0) {
          const [conv] = updated.splice(idx, 1);
          updated.unshift(conv);
          useChatStore.getState().setConversations(updated);
        }
        return;
      }

      addMessage(message);

      const { conversations: currentConvs } = useChatStore.getState();
      const updated = [...currentConvs];
      const idx = updated.findIndex(
        (c) => c.conversationId === message.conversationId
      );

      if (idx > 0) {
        const [conv] = updated.splice(idx, 1);
        updated.unshift(conv);
        useChatStore.getState().setConversations(updated);
      } else if (idx === -1) {
        const fresh = await messageApi.getConversations();
        const sorted = [...fresh].sort((a, b) =>
          new Date(b.conversation.updatedAt).getTime() -
          new Date(a.conversation.updatedAt).getTime()
        );
        useChatStore.getState().setConversations(sorted);
      }
    });

    socket.on('conversation:show', async () => {
      const fresh = await messageApi.getConversations();
      const sorted = [...fresh].sort((a, b) =>
        new Date(b.conversation.updatedAt).getTime() -
        new Date(a.conversation.updatedAt).getTime()
      );
      useChatStore.getState().setConversations(sorted);
    });

    socket.on('typing:start', ({ userId, conversationId }: any) => {
      setTyping(conversationId, userId, true);
    });

    socket.on('typing:stop', ({ userId, conversationId }: any) => {
      setTyping(conversationId, userId, false);
    });

    socket.on('presence:update', ({ userId, isOnline }: any) => {
      if (isOnline) setUserOnline(userId);
      else setUserOffline(userId);
    });

    socket.on('notification:new', (notification: any) => {
      addNotification(notification);
    });

    socket.on('unread:update', ({ unreadCounts }: any) => {
      const total = unreadCounts.reduce(
        (sum: number, u: any) => sum + u.count, 0
      );
      setUnreadCount(total);
    });

    socket.on('reaction:update', ({ messageId, reactions }: any) => {
      setReactions(messageId, reactions);
    });

    return () => {
      socket.off('message:receive');
      socket.off('conversation:show');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('presence:update');
      socket.off('notification:new');
      socket.off('unread:update');
      socket.off('reaction:update');
      disconnectSocket();
    };
  }, [isAuthenticated]);
};