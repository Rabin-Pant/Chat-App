# Chat App — Real-time Messaging Application

A full-stack real-time chat application built with Next.js, Express.js, Socket.IO, TypeORM, and PostgreSQL.

## Features

### Authentication
- OTP-based passwordless login via email
- Google OAuth 2.0 login
- JWT access + refresh tokens
- New user onboarding (display name setup)

### Messaging
- One-to-one direct messaging
- Group chat with multiple members
- Real-time message delivery via Socket.IO
- Message reply / quote
- Emoji reactions (❤️ 😂 😢 😡 😮 👍)
- Image upload and sharing
- Read receipts (✓ sent, ✓✓ read)
- Typing indicators

### Message Management
- Delete for me (soft delete — only from your view)
- Delete for everyone (hard delete — tombstone shown)
- Clear entire conversation (soft delete from sidebar)

### Groups
- Create groups with name and description
- Add / remove members
- Group detail page with member roles (owner, admin, member)
- Group avatar

### User Management
- User profiles with avatar upload
- Display name update
- Search users by name or email
- Online / offline presence indicator
- Last seen timestamp
- Last seen privacy settings (everyone / nobody)

### Notifications
- Real-time push notifications via socket
- Unread message count badge
- Mark as read / mark all as read
- Delete individual or all notifications
- Click notification to navigate to conversation

### Privacy & Safety
- Block / unblock users
- Blocked users cannot send DMs
- Blocked users still visible in shared groups (with warning)
- Blocked users hidden from search

### UI / UX
- Dark mode toggle (persisted across sessions)
- Mobile responsive layout
- Sidebar collapses on mobile when chat is open
- Conversations sorted by latest message
- Last message preview in sidebar
- Avatar display throughout the app

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Auth**: Passport.js (Google OAuth), JWT, bcrypt
- **Email**: Nodemailer (Gmail)
- **File upload**: Multer
- **Architecture**: OOP / Class-based (Controllers, Services, Repositories)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand (with persist)
- **HTTP**: Axios
- **Real-time**: Socket.IO client
- **Font**: Geist

## Project Structure

```
chat-app/

├── backend/

│   ├── src/

│   │   ├── config/          # database, passport, env

│   │   ├── common/          # base classes, types

│   │   ├── middleware/       # auth, upload, rate-limit, error

│   │   ├── modules/

│   │   │   ├── auth/        # OTP, Google OAuth, JWT

│   │   │   ├── users/       # profiles, search, blocking

│   │   │   ├── conversations/

│   │   │   ├── messages/

│   │   │   ├── groups/

│   │   │   ├── reactions/

│   │   │   ├── notifications/

│   │   │   └── presence/

│   │   ├── sockets/         # Socket.IO gateways

│   │   ├── app.ts

│   │   └── server.ts

│   ├── migrations/

│   ├── uploads/

│   └── .env

├── frontend/

│   ├── src/

│   │   ├── app/

│   │   │   ├── (auth)/      # login, otp, callback, setup

│   │   │   ├── chat/        # sidebar layout + conversations

│   │   │   └── profile/

│   │   ├── components/

│   │   │   └── chat/        # all chat UI components

│   │   ├── hooks/           # useSocket, useAuth

│   │   ├── services/        # API wrappers

│   │   ├── store/           # Zustand stores

│   │   ├── lib/             # axios client, socket singleton

│   │   └── types/

│   └── .env.local

└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- Docker (optional, for Redis + PostgreSQL)
- Gmail account with App Password enabled
- Google Cloud Console project with OAuth 2.0 credentials

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run migration:run
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Environment Variables

**backend/.env**
```
PORT=5000

NODE_ENV=development

DB_HOST=localhost

DB_PORT=5432

DB_USER=chatuser

DB_PASSWORD=chatpassword

DB_NAME=chatapp

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d

JWT_REFRESH_SECRET=your_refresh_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

EMAIL_USER=your_gmail@gmail.com

EMAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/otp/request | Request OTP |
| POST | /api/auth/otp/verify | Verify OTP |
| GET | /api/auth/google | Google OAuth |
| GET | /api/users/me | Get profile |
| PUT | /api/users/me | Update profile |
| GET | /api/users/search | Search users |
| GET | /api/chat/conversations | Get all conversations |
| POST | /api/chat/conversations/dm/:userId | Start DM |
| GET | /api/chat/conversations/:id/messages | Get messages |
| POST | /api/chat/conversations/:id/messages | Send message |
| POST | /api/groups | Create group |
| POST | /api/blocks/:userId | Block user |
| DELETE | /api/blocks/:userId | Unblock user |
| GET | /api/notifications | Get notifications |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| message:receive | Server → Client | New message |
| message:deleted | Server → Client | Message deleted |
| message:read | Bidirectional | Read receipt |
| typing:start | Client → Server | User typing |
| typing:stop | Client → Server | User stopped typing |
| presence:update | Server → Client | Online/offline |
| reaction:update | Server → Client | Reaction changed |
| notification:new | Server → Client | New notification |
| unread:update | Server → Client | Unread count |

---

## 📄 License

MIT License — feel free to use this project for learning and personal projects.

---

<div align="center">
Made with ❤️ by <strong>Rabin Pant</strong>
</div>