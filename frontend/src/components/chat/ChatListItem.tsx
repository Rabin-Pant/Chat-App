'use client';
import { UserConversation } from '@/types/chat.types';
import { useChatStore } from '@/store/chat.store';
import { usePresenceStore } from '@/store/presence.store';

interface Props {
  userConversation: UserConversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({ userConversation, isActive, onClick }: Props) {
  const { messages } = useChatStore();
  const { isOnline } = usePresenceStore();

  const convMessages = messages[userConversation.conversationId] || [];
  const lastMessageFromStore = convMessages[convMessages.length - 1];
  const lastMessage = lastMessageFromStore || userConversation.lastMessage;

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

  const online = isDM && userConversation.otherUser
    ? isOnline(userConversation.otherUser.id)
    : false;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
    <div className="relative shrink-0">
  {isDM && userConversation.otherUser?.avatarUrl ? (
   <img
  src={userConversation.otherUser.avatarUrl}
  alt="Avatar"
  crossOrigin="anonymous"
  className="w-10 h-10 rounded-full object-cover"
/>
  ) : (
    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm">
      {avatar}
    </div>
  )}
  {isDM && (
    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
      online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
    }`} />
  )}
</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
          {lastMessage && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-1">
              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {lastMessage
            ? lastMessage.type === 'deleted'
              ? 'Message deleted'
              : lastMessage.content
            : 'No messages yet'}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
  {lastMessage
    ? lastMessage.type === 'deleted'
      ? 'Message deleted'
      : lastMessage.type === 'image'
      ? '📷 Photo'
      : lastMessage.content
    : 'No messages yet'}
</p>
      </div>
    </div>
  );
}