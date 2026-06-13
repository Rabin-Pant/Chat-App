import { useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chat.store';
import { useNotificationStore } from '@/store/notification.store';
import { usePresenceStore } from '@/store/presence.store';
import { Message } from '@/types/chat.types';

export const useSocket = (isAuthenticated: boolean) => {
  const { addMessage, updateMessage, removeMessage, setTyping, setReactions } = useChatStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const { setUserOnline, setUserOffline } = usePresenceStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    socket.on('message:receive', (message: Message) => {
      addMessage(message);
    });

    socket.on('message:deleted', ({ messageId, conversationId, type }: any) => {
      if (type === 'hard') {
        updateMessage(messageId, { type: 'deleted', content: null });
      } else {
        removeMessage(messageId, conversationId);
      }
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
      const total = unreadCounts.reduce((sum: number, u: any) => sum + u.count, 0);
      setUnreadCount(total);
    });

    socket.on('reaction:update', ({ messageId, reactions }: any) => {
      setReactions(messageId, reactions);
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:deleted');
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