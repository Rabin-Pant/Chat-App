'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { messageApi } from '@/services/message.api';
import apiClient from '@/lib/api.client';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';
import NotificationPanel from './NotificationPanel';

export default function Sidebar() {
  const router = useRouter();
  const { conversations, setConversations, activeConversationId } = useChatStore();
  const { user, clearAuth, updateUser } = useAuthStore();
  const { unreadCount, setNotifications, setUnreadCount } = useNotificationStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

 useEffect(() => {
  messageApi.getConversations().then((data) => {
    const sorted = [...data].sort((a, b) =>
      new Date(b.conversation.updatedAt).getTime() -
      new Date(a.conversation.updatedAt).getTime()
    );
    setConversations(sorted);
  }).finally(() => setLoading(false));

  apiClient.get('/notifications').then(({ data }) => {
    setNotifications(data.notifications);
  });

  apiClient.get('/notifications/unread-count').then(({ data }) => {
    setUnreadCount(data.count);
  });
}, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      await apiClient.put('/users/me', { displayName: newName.trim() });
      updateUser({ displayName: newName.trim() });
      setEditingName(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { setEditingName(true); setNewName(user?.displayName || ''); }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {user?.displayName || user?.email}
              </p>
              {!user?.displayName && (
                <p className="text-xs text-blue-500">Click to set name</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="New chat"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {editingName && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="Enter your name..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-300 text-xs mt-1">Start a new chat</p>
          </div>
        ) : (
          conversations.map((uc) => (
            <ChatListItem
              key={uc.id}
              userConversation={uc}
              isActive={activeConversationId === uc.conversationId}
              onClick={() => router.push(`/chat/${uc.conversationId}`)}
            />
          ))
        )}
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}