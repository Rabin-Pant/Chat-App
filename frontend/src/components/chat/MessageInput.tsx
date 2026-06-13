'use client';
import { useState, useRef } from 'react';
import { messageApi } from '@/services/message.api';
import { useChatStore } from '@/store/chat.store';
import { getSocket } from '@/lib/socket';

interface Props {
  conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { addMessage } = useChatStore();
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const socket = getSocket();

  const handleTyping = () => {
    socket.emit('typing:start', conversationId);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', conversationId);
    }, 2000);
  };

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const message = await messageApi.sendMessage(conversationId, content.trim());
      addMessage(message);
      setContent('');
      socket.emit('typing:stop', conversationId);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2">
        <input
          type="text"
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          aria-label="Send message"
          className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition shrink-0"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}