'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { messageApi } from '@/services/message.api';
import { useChatStore } from '@/store/chat.store';

interface Props {
  conversationId: string;
  onClose: () => void;
}

export default function ClearChatDialog({ conversationId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setMessages, setConversations, conversations } = useChatStore();

  const handleClear = async () => {
    setLoading(true);
    try {
      await messageApi.clearConversation(conversationId);
      setMessages(conversationId, []);
      setConversations(
        conversations.filter((c) => c.conversationId !== conversationId)
      );
      router.push('/chat');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Delete chat</h2>
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
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-6">
            Once you delete your copy of this conversation, it cannot be undone.
            The other person will still be able to see the messages.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Deleting...' : 'Delete chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}