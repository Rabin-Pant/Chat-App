'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { usePresenceStore } from '@/store/presence.store';
import { messageApi } from '@/services/message.api';
import { getSocket } from '@/lib/socket';
import { User, Group } from '@/types/chat.types';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ClearChatDialog from '@/components/chat/ClearChatDialog';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { user } = useAuthStore();
  const {
    messages,
    setMessages,
    addMessage,
    setActiveConversation,
    typingUsers,
    updateMessage,
    removeMessage,
    conversations,
  } = useChatStore();
  const { isOnline } = usePresenceStore();
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const convMessages = messages[conversationId] || [];
  const typingInConv = typingUsers[conversationId] || [];

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversation(conversationId);
    const socket = getSocket();
    socket.emit('join:conversation', conversationId);

    messageApi.getMessages(conversationId).then((msgs) => {
      setMessages(conversationId, msgs);
    }).finally(() => setLoading(false));

    const uc = conversations.find((c) => c.conversationId === conversationId);
    if (uc) {
      if (uc.conversation.type === 'dm' && uc.otherUser) {
        setOtherUser(uc.otherUser);
      } else if (uc.conversation.type === 'group' && uc.group) {
        setGroup(uc.group as Group);
      }
    }

    const handleNewMessage = (message: any) => {
      if (message.conversationId === conversationId) {
        addMessage(message);
      }
    };

    const handleMessageDeleted = ({ messageId, type }: any) => {
      if (type === 'hard') {
        updateMessage(messageId, { type: 'deleted', content: null });
      } else {
        removeMessage(messageId, conversationId);
      }
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.off('message:receive', handleNewMessage);
      socket.off('message:deleted', handleMessageDeleted);
      setActiveConversation(null);
    };
  }, [conversationId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  const headerName = otherUser
    ? otherUser.displayName || otherUser.email
    : group
    ? group.name
    : 'Conversation';

  const headerAvatar = otherUser
    ? otherUser.displayName?.[0] || otherUser.email[0].toUpperCase()
    : group
    ? '#'
    : '?';

  const online = otherUser ? isOnline(otherUser.id) : false;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
              {headerAvatar}
            </div>
            {otherUser && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  online ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
          <div
            className={group ? 'cursor-pointer' : ''}
            onClick={() =>
              group && router.push(`/chat/${conversationId}/group`)
            }
          >
            <p className="text-sm font-medium text-gray-900">{headerName}</p>
            {otherUser && (
              <p className="text-xs text-gray-400">
                {online
                  ? 'Online'
                  : otherUser.lastSeenAt
                  ? `Last seen ${new Date(otherUser.lastSeenAt).toLocaleTimeString(
                      [],
                      { hour: '2-digit', minute: '2-digit' }
                    )}`
                  : 'Offline'}
              </p>
            )}
            {group && (
              <p className="text-xs text-blue-500">
                {group.members?.length || 0} members · tap to view
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="More options"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01"
              />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-40">
              {group && (
                <button
                  onClick={() => {
                    router.push(`/chat/${conversationId}/group`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Group info
                </button>
              )}
              <button
                onClick={() => {
                  setShowClearDialog(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete chat
              </button>
            </div>
          )}
        </div>
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

      {showClearDialog && (
        <ClearChatDialog
          conversationId={conversationId}
          onClose={() => setShowClearDialog(false)}
        />
      )}
    </div>
  );
}