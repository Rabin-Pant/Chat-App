'use client';
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat.types';
import { messageApi } from '@/services/message.api';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/api.client';

interface Props {
  message: Message;
  isOwn: boolean;
  conversationId: string;
  isGroup?: boolean;
  onReply?: (message: Message) => void;
}

const EMOJIS = ['heart', 'laugh', 'sad', 'angry', 'wow', 'thumbsup'];
const EMOJI_MAP: Record<string, string> = {
  heart: '❤️', laugh: '😂', sad: '😢',
  angry: '😡', wow: '😮', thumbsup: '👍',
};

export default function MessageBubble({ message, isOwn, conversationId, isGroup, onReply }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const { updateMessage, removeMessage, reactions, setReactions } = useChatStore();
  const { user } = useAuthStore();

  const messageReactions = reactions[message.id] || {};

  useEffect(() => {
    apiClient.get(`/reactions/${message.id}`).then(({ data }) => {
      setReactions(message.id, data.reactions || {});
    }).catch(() => {});
  }, [message.id]);

  if (message.type === 'deleted') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
        <span className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-2xl">
          This message was deleted
        </span>
      </div>
    );
  }

  if (message.type === 'unsent') return null;

  const handleSoftDelete = async () => {
    await messageApi.softDelete(message.id);
    removeMessage(message.id, conversationId);
    setShowMenu(false);
  };

  const handleHardDelete = async () => {
    await messageApi.hardDelete(message.id);
    updateMessage(message.id, { type: 'deleted', content: null });
    setShowMenu(false);
  };

  const handleUnsend = async () => {
    await messageApi.unsend(message.id);
    removeMessage(message.id, conversationId);
    setShowMenu(false);
  };

  const handleReaction = async (emoji: string) => {
    await apiClient.post(`/reactions/${message.id}`, { emoji });
    setReactions(message.id, {
      ...messageReactions,
      [emoji]: {
        count: (messageReactions[emoji]?.count || 0) + 1,
        userIds: [...(messageReactions[emoji]?.userIds || []), user?.id || ''],
      },
    });
    setShowReactions(false);
  };

  const reactionEntries = Object.entries(messageReactions).filter(([, v]) => v.count > 0);
  const isRead = (message.readByUsers?.length || 0) > 0;

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}
      onMouseLeave={() => { setShowMenu(false); setShowReactions(false); }}
    >

      {!isOwn && isGroup && message.sender && (
  <p className="text-xs font-medium text-blue-500 dark:text-blue-400 mb-1 px-1">
    {message.sender.displayName || message.sender.email}
  </p>
)}
      <div className="relative max-w-xs lg:max-w-md">

        {message.replyTo && (
          <div className={`mb-1 px-3 py-2 rounded-xl text-xs border-l-4 border-blue-400 ${
            isOwn
              ? 'bg-blue-700/30 text-blue-100'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
            <p className="font-medium mb-0.5 text-blue-400">
              {message.replyTo.sender?.displayName ||
                message.replyTo.sender?.email ||
                'User'}
            </p>
            <p className="truncate">
              {message.replyTo.type === 'image' ? '📷 Photo' : message.replyTo.content}
            </p>
          </div>
        )}

        {message.type === 'image' ? (
          <div className={`rounded-2xl overflow-hidden ${
            isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}>
            <img
              src={message.content || ''}
              alt="Image"
              crossOrigin="anonymous"
              className="max-w-xs max-h-64 object-cover cursor-pointer"
              onClick={() => window.open(message.content || '', '_blank')}
            />
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-2xl text-sm ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}>
            {message.content}
          </div>
        )}

        {reactionEntries.length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            {reactionEntries.map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition ${
                  data.userIds.includes(user?.id || '')
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{EMOJI_MAP[emoji]}</span>
                <span>{data.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`flex items-center gap-1 mt-0.5 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {isOwn && (
            <span className={`text-xs font-medium ${
              isRead ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        <div className={`absolute top-0 ${
          isOwn
            ? 'left-0 -translate-x-full pr-1'
            : 'right-0 translate-x-full pl-1'
        } hidden group-hover:flex items-center gap-1`}>
          <button
            onClick={() => onReply?.(message)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"
            title="Reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="React"
          >
            😊
          </button>
          {isOwn && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"
              title="More options"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
              </svg>
            </button>
          )}
        </div>

        {showReactions && (
          <div className={`absolute top-8 ${
            isOwn ? 'right-0' : 'left-0'
          } bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-2 flex gap-1 z-10`}>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform"
                title={emoji}
              >
                {EMOJI_MAP[emoji]}
              </button>
            ))}
          </div>
        )}

        {showMenu && isOwn && (
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-10 min-w-40">
            <button
              onClick={() => { onReply?.(message); setShowMenu(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Reply
            </button>
            <button
              onClick={handleSoftDelete}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Delete for me
            </button>
            <button
              onClick={handleUnsend}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Unsend
            </button>
            <button
              onClick={handleHardDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete for everyone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}