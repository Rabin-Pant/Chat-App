'use client';
import { useState, useRef } from 'react';
import { messageApi } from '@/services/message.api';
import { useChatStore } from '@/store/chat.store';
import { getSocket } from '@/lib/socket';
import apiClient from '@/lib/api.client';

interface Props {
  conversationId: string;
}

export default function MessageInput({ conversationId }: Props) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addMessage } = useChatStore();
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const message = await apiClient.post(
        `/chat/conversations/${conversationId}/messages`,
        { content: data.url, type: 'image' }
      );
      addMessage(message.data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2">
       <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  aria-label="Upload image"
  className="hidden"
/>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload image"
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition shrink-0 disabled:opacity-40"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>

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