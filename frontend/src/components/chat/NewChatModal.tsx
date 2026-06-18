'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { messageApi } from '@/services/message.api';
import apiClient from '@/lib/api.client';
import { User, Group } from '@/types/chat.types';
import { useChatStore } from '@/store/chat.store';
import CreateGroupModal from './CreateGroupModal';

interface Props {
  onClose: () => void;
}

export default function NewChatModal({ onClose }: Props) {
  const router = useRouter();
  const { setConversations } = useChatStore();
  const [tab, setTab] = useState<string>('dm');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) { setUsers([]); setGroups([]); return; }
    setLoading(true);
    try {
      if (tab === 'dm') {
        const { data } = await apiClient.get(`/users/search?q=${value}`);
        setUsers(data.users);
      } else if (tab === 'findgroup') {
        const { data } = await apiClient.get(`/groups/search?q=${value}`);
        setGroups(data.groups);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDM = async (userId: string) => {
  try {
    const conversation = await messageApi.startDM(userId);
    const updated = await messageApi.getConversations();
    const sorted = [...updated].sort((a, b) =>
      new Date(b.conversation.updatedAt).getTime() -
      new Date(a.conversation.updatedAt).getTime()
    );
    setConversations(sorted);
    router.push(`/chat/${conversation.id}`);
    onClose();
  } catch (err) {
    console.error(err);
  }
};

  const handleOpenGroup = async (group: Group) => {
    try {
      await apiClient.put(`/chat/conversations/${group.conversationId}/unhide`);
      const updated = await messageApi.getConversations();
      const sorted = [...updated].sort((a, b) =>
        new Date(b.conversation.updatedAt).getTime() -
        new Date(a.conversation.updatedAt).getTime()
      );
      setConversations(sorted);
      router.push(`/chat/${group.conversationId}`);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (tab === 'newgroup') {
    return <CreateGroupModal onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            New conversation
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1 p-4 pb-0">
          <button
            onClick={() => { setTab('dm'); setQuery(''); setUsers([]); setGroups([]); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
              tab === 'dm'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Direct message
          </button>
          <button
            onClick={() => { setTab('findgroup'); setQuery(''); setUsers([]); setGroups([]); }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
              tab === 'findgroup'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Find group
          </button>
          <button
            onClick={() => setTab('newgroup')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
              tab === 'newgroup'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            New group
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={
              tab === 'dm'
                ? 'Search by name or email...'
                : 'Search your groups by name...'
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === 'dm' ? (
            users.length === 0 && query.length >= 2 ? (
              <p className="text-center text-gray-400 text-sm py-4">No users found</p>
            ) : (
             users.map((user) => (
  <div
    key={user.id}
    onClick={() => handleStartDM(user.id)}
    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
  >
    <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName || user.email}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm">
          {user.displayName?.[0] || user.email[0].toUpperCase()}
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {user.displayName || user.email}
      </p>
      <p className="text-xs text-gray-400">{user.email}</p>
    </div>
  </div>
))
            )
          ) : tab === 'findgroup' ? (
            groups.length === 0 && query.length >= 2 ? (
              <p className="text-center text-gray-400 text-sm py-4">No groups found</p>
            ) : groups.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">
                Type to search your groups
              </p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleOpenGroup(group)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm shrink-0">
                    #
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {group.name}
                    </p>
                    {group.description && (
                      <p className="text-xs text-gray-400">{group.description}</p>
                    )}
                  </div>
                </div>
              ))
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}