-- Chat App Database Schema
-- PostgreSQL 16+
-- Run: psql -U chatuser -d chatapp -f schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE users_role_enum AS ENUM ('user', 'admin');
CREATE TYPE conversations_type_enum AS ENUM ('dm', 'group');
CREATE TYPE group_members_role_enum AS ENUM ('owner', 'admin', 'member');
CREATE TYPE messages_type_enum AS ENUM ('text', 'image', 'file', 'deleted', 'unsent');
CREATE TYPE messages_status_enum AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE notifications_type_enum AS ENUM ('new_message', 'group_invite', 'reaction');

-- Users
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email varchar NOT NULL UNIQUE,
  "displayName" varchar,
  "avatarUrl" varchar,
  "googleId" varchar,
  role users_role_enum DEFAULT 'user' NOT NULL,
  "isVerified" boolean DEFAULT false NOT NULL,
  "isOnline" boolean DEFAULT false NOT NULL,
  "lastSeenAt" timestamp,
  "lastSeenPrivacy" varchar DEFAULT 'everyone',
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- OTPs
CREATE TABLE otps (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "codeHash" varchar NOT NULL,
  "expiresAt" timestamp NOT NULL,
  attempts integer DEFAULT 0 NOT NULL,
  "isUsed" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Conversations
CREATE TABLE conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type conversations_type_enum NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- User Conversations (membership)
CREATE TABLE user_conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  "clearedAt" timestamp,
  "isMuted" boolean DEFAULT false NOT NULL,
  "isArchived" boolean DEFAULT false NOT NULL,
  "isHidden" boolean DEFAULT false,
  "lastReadAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Messages
CREATE TABLE messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "conversationId" uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  "senderId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text,
  type messages_type_enum DEFAULT 'text' NOT NULL,
  status messages_status_enum DEFAULT 'sent' NOT NULL,
  "deletedForUsers" text,
  "readByUsers" text,
  "replyToId" uuid REFERENCES messages(id) ON DELETE SET NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Groups
CREATE TABLE groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "conversationId" uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  "ownerId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  "avatarUrl" varchar,
  description text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Group Members
CREATE TABLE group_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "groupId" uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role group_members_role_enum DEFAULT 'member' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  UNIQUE ("groupId", "userId")
);

-- Reactions
CREATE TABLE reactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "messageId" uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji varchar(10) NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  UNIQUE ("messageId", "userId")
);

-- Notifications
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notifications_type_enum NOT NULL,
  payload jsonb,
  "isRead" boolean DEFAULT false NOT NULL,
  "readAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Unreads
CREATE TABLE unreads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  count integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  UNIQUE ("userId", "conversationId")
);

-- Blocks
CREATE TABLE blocks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "blockerId" uuid REFERENCES users(id) ON DELETE CASCADE,
  "blockedId" uuid REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" timestamp DEFAULT now(),
  UNIQUE ("blockerId", "blockedId")
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages("conversationId");
CREATE INDEX idx_messages_sender ON messages("senderId");
CREATE INDEX idx_user_conversations_user ON user_conversations("userId");
CREATE INDEX idx_user_conversations_conversation ON user_conversations("conversationId");
CREATE INDEX idx_notifications_user ON notifications("userId");
CREATE INDEX idx_unreads_user ON unreads("userId");
CREATE INDEX idx_blocks_blocker ON blocks("blockerId");
CREATE INDEX idx_blocks_blocked ON blocks("blockedId");