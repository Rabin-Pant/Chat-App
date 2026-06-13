'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { messageApi } from '@/services/message.api';
import { getSocket } from '@/lib/socket';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useAuthStore();
  const { messages, setMessages, setActiveConversation, typingUsers } = useChatStore();
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const convMessages = messages[conversationId] || [];
  const typingInConv = typingUsers[conversationId] || [];

  useEffect(() => {
    setActiveConversation(conversationId);
    const socket = getSocket();
    socket.emit('join:conversation', conversationId);

    messageApi.getMessages(conversationId).then((msgs) => {
      setMessages(conversationId, msgs);
    }).finally(() => setLoading(false));

    return () => {
      socket.emit('leave:conversation', conversationId);
      setActiveConversation(null);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">#</span>
        </div>
        <span className="text-sm font-medium text-gray-900">Conversation</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {convMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          convMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.id}
              conversationId={conversationId}
            />
          ))
        )}
        {typingInConv.length > 0 && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
}