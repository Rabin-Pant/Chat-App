'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { groupApi } from '@/services/group.api';
import { Group, GroupMember } from '@/types/chat.types';
import apiClient from '@/lib/api.client';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { conversations } = useChatStore();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchUsers, setSearchUsers] = useState<any[]>([]);

  useEffect(() => {
    const uc = conversations.find((c) => c.conversationId === conversationId);
    if (uc?.group) {
      setGroup(uc.group as Group);
    }
    setLoading(false);
  }, [conversationId, conversations]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) { setSearchUsers([]); return; }
    const { data } = await apiClient.get(`/users/search?q=${value}`);
    setSearchUsers(data.users);
  };

  const handleAddMember = async (userId: string) => {
    if (!group) return;
    try {
      await groupApi.addMember(group.id, userId);
      const updated = await groupApi.getGroup(group.id);
      setGroup(updated);
      setQuery('');
      setSearchUsers([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!group) return;
    try {
      await groupApi.removeMember(group.id, userId);
      setGroup((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.userId !== userId) }
          : null
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Group not found</p>
      </div>
    );
  }

  const isOwnerOrAdmin = group.members?.some(
    (m) => m.userId === user?.id && (m.role === 'owner' || m.role === 'admin')
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-medium text-gray-900">Group info</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-medium mb-3">
            #
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-gray-400 mt-1 text-center">{group.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{group.members?.length || 0} members</p>
        </div>

        {isOwnerOrAdmin && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Add member
            </p>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchUsers.length > 0 && (
              <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                {searchUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleAddMember(u.id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                      {u.displayName?.[0] || u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.displayName || u.email}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Members
          </p>
          <div className="space-y-1">
            {group.members?.map((member: GroupMember) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                    {member.user?.displayName?.[0] ||
                      member.user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user?.displayName || member.user?.email}
                      {member.userId === user?.id && (
                        <span className="text-gray-400 font-normal"> (you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      member.role === 'owner'
                        ? 'bg-purple-100 text-purple-700'
                        : member.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.role}
                  </span>
                  {isOwnerOrAdmin &&
                    member.userId !== user?.id &&
                    member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-1 hover:bg-red-50 rounded-lg transition"
                        title="Remove member"
                      >
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}