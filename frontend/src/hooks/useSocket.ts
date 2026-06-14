import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chat.store';
import { useNotificationStore } from '@/store/notification.store';
import { usePresenceStore } from '@/store/presence.store';
import { messageApi } from '@/services/message.api';

export const useSocket = (isAuthenticated: boolean) => {
  const { setTyping, setReactions, addMessage, setConversations, conversations } = useChatStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const { setUserOnline, setUserOffline } = usePresenceStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    socket.on('message:receive', async (message: any) => {
      addMessage(message);
      const convIndex = conversations.findIndex(
        (c) => c.conversationId === message.conversationId
      );
      if (convIndex > 0) {
        const updated = [...conversations];
        const [conv] = updated.splice(convIndex, 1);
        updated.unshift(conv);
        setConversations(updated);
      } else if (convIndex === -1) {
        const fresh = await messageApi.getConversations();
        const sorted = [...fresh].sort((a, b) =>
          new Date(b.conversation.updatedAt).getTime() -
          new Date(a.conversation.updatedAt).getTime()
        );
        setConversations(sorted);
      }
    });

    socket.on('conversation:show', async () => {
      const conversations = await messageApi.getConversations();
      const sorted = [...conversations].sort((a, b) =>
        new Date(b.conversation.updatedAt).getTime() -
        new Date(a.conversation.updatedAt).getTime()
      );
      setConversations(sorted);
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
  }, [isAuthenticated, conversations]);
};