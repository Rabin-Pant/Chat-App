export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  DELETED = 'deleted',
  UNSENT = 'unsent',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum ConversationType {
  DM = 'dm',
  GROUP = 'group',
}

export enum GroupMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  GROUP_INVITE = 'group_invite',
  REACTION = 'reaction',
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}