'use client';
import { UserConversation } from '@/types/chat.types';
import { useChatStore } from '@/store/chat.store';

interface Props {
  userConversation: UserConversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({ userConversation, isActive, onClick }: Props) {
  const { messages } = useChatStore();
  const convMessages = messages[userConversation.conversationId] || [];
  const lastMessage = convMessages[convMessages.length - 1];

  const isDM = userConversation.conversation.type === 'dm';
  const name = isDM
    ? userConversation.otherUser?.displayName ||
      userConversation.otherUser?.email ||
      'Direct Message'
    : userConversation.group?.name || 'Group';

  const avatar = isDM
    ? userConversation.otherUser?.displayName?.[0] ||
      userConversation.otherUser?.email?.[0]?.toUpperCase() ||
      '?'
    : '#';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
        isActive ? 'bg-blue-50' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        <span className="text-sm font-medium text-gray-600">{avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          {lastMessage && (
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">
          {lastMessage
            ? lastMessage.type === 'deleted'
              ? 'Message deleted'
              : lastMessage.content
            : 'No messages yet'}
        </p>
      </div>
    </div>
  );
}