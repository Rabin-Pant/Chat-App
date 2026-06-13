'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { messageApi } from '@/services/message.api';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';

export default function Sidebar() {
  const router = useRouter();
  const { conversations, setConversations, activeConversationId } = useChatStore();
  const { user, clearAuth } = useAuthStore();
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageApi.getConversations().then((data) => {
      setConversations(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {user?.displayName || user?.email}
          </span>
        </div>
        <div className="flex items-center gap-1">
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
    </div>
  );
}