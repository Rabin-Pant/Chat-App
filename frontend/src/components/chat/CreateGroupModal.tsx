'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupApi } from '@/services/group.api';
import apiClient from '@/lib/api.client';
import { User } from '@/types/chat.types';
import { useChatStore } from '@/store/chat.store';
import { messageApi } from '@/services/message.api';

interface Props {
  onClose: () => void;
}

export default function CreateGroupModal({ onClose }: Props) {
  const router = useRouter();
  const { setConversations } = useChatStore();
  const [step, setStep] = useState<'name' | 'members'>('name');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) { setUsers([]); return; }
    setSearching(true);
    try {
      const { data } = await apiClient.get(`/users/search?q=${value}`);
      setUsers(data.users);
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (user: User) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      await groupApi.createGroup(
        groupName.trim(),
        selected.map((u) => u.id),
        description.trim() || undefined
      );
      const conversations = await messageApi.getConversations();
      setConversations(conversations);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {step === 'name' ? 'New group' : 'Add members'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'name' ? (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && groupName.trim() && setStep('members')}
                placeholder="e.g. Team Alpha"
                maxLength={50}
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setStep('members')}
              disabled={!groupName.trim()}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Next — Add members
            </button>
          </div>
        ) : (
          <div className="p-4">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selected.map((u) => (
                  <span
                    key={u.id}
                    onClick={() => toggleUser(u)}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition"
                  >
                    {u.displayName || u.email}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search people..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto mb-4">
              {searching ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : users.length === 0 && query.length >= 2 ? (
                <p className="text-center text-gray-400 text-sm py-4">No users found</p>
              ) : (
                users.map((user) => {
                  const isSelected = !!selected.find((u) => u.id === user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName || user.email}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('name')}
                className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Creating...' : `Create group${selected.length > 0 ? ` (${selected.length})` : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}