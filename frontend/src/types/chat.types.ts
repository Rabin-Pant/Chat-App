export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: 'text' | 'image' | 'file' | 'deleted' | 'unsent';
  status: 'sent' | 'delivered' | 'read';
  deletedForUsers: string[];
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  createdAt: string;
  updatedAt: string;
}

export interface UserConversation {
  id: string;
  userId: string;
  conversationId: string;
  clearedAt: string | null;
  isMuted: boolean;
  isArchived: boolean;
  lastReadAt: string | null;
  conversation: Conversation;
  otherUser?: User;
  group?: Group;
  lastMessage?: Message | null;
}

export interface Group {
  id: string;
  conversationId: string;
  name: string;
  avatarUrl: string | null;
  description: string | null;
  ownerId: string;
  members: GroupMember[];
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
  createdAt: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_message' | 'group_invite' | 'reaction';
  payload: Record<string, any>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}