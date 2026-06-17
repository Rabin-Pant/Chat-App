<div align="center">

# 💬 Chat App

A full-stack real-time chat application built with modern technologies.
Supports direct messaging, group chats, emoji reactions, image sharing, and more.

**[Live Demo](https://chat-app-psi-ecru-73.vercel.app) · [Backend API](https://chat-app-backend-bi0w.onrender.com/health) · [Report Bug](https://github.com/Rabin-Pant/Chat-App/issues)**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)

</div>

---

## ✨ Features

### 🔐 Authentication
- Passwordless login via **Email OTP**
- **Google OAuth 2.0** sign-in
- JWT access + refresh token rotation
- New user onboarding with display name setup

### 💬 Messaging
- **Real-time** one-to-one direct messaging
- **Group chats** with multiple members
- **Message reply** — quote any message
- **Emoji reactions** — ❤️ 😂 😢 😡 😮 👍
- **Image upload** — share photos in chat
- **Read receipts** — ✓ sent, ✓✓ read
- **Typing indicators** — see when someone is typing

### 🗑️ Message Management
- **Delete for me** — remove from your view only
- **Delete for everyone** — replaces with tombstone for all

### 👥 Groups
- Create groups with name and description
- Add / remove members
- Member roles — Owner, Admin, Member
- Group info page

### 👤 User Management
- Profile page with **avatar upload**
- Display name update
- Search users by **name or email**
- **Online / offline** presence indicator
- **Last seen** timestamp
- **Last seen privacy** — Everyone / Nobody

### 🔔 Notifications
- Real-time push notifications
- Unread message badge
- Click notification to jump to conversation
- Mark as read / Mark all as read
- Delete individual or all notifications

### 🔒 Privacy & Safety
- **Block / unblock** users
- Blocked users cannot send DMs
- Blocked users visible in shared groups with warning
- Blocked users hidden from search

### 🎨 UI / UX
- **Dark mode** toggle — persisted across sessions
- **Mobile responsive** — sidebar collapses on small screens
- Conversations sorted by **latest message**
- Last message preview in sidebar
- Avatar display throughout the app
- Long press on mobile to access message actions

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + TypeScript | Runtime & language |
| Express.js | HTTP server |
| Socket.IO | Real-time communication |
| TypeORM | Database ORM |
| PostgreSQL (Neon) | Primary database |
| Passport.js | Google OAuth strategy |
| JWT + bcrypt | Authentication & security |
| Nodemailer | OTP email delivery |
| Multer | File / image upload |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Zustand | Global state management |
| Axios | HTTP client |
| Socket.IO Client | Real-time events |

### Infrastructure
| Service | Purpose |
|---|---|
| Render | Backend hosting |
| Vercel | Frontend hosting |
| Neon | Managed PostgreSQL |

---

## 🏗️ Architecture

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/           # Database, Passport, env config
│   │   ├── common/           # Base classes, shared types
│   │   ├── middleware/        # Auth, upload, rate-limit, error
│   │   ├── modules/
│   │   │   ├── auth/         # OTP, Google OAuth, JWT
│   │   │   ├── users/        # Profiles, search, blocking
│   │   │   ├── conversations/ # DM & group conversation logic
│   │   │   ├── messages/     # Send, delete, read receipts
│   │   │   ├── groups/       # Group management
│   │   │   ├── reactions/    # Emoji reactions
│   │   │   ├── notifications/ # Push notifications
│   │   │   └── presence/     # Online status, unread counts
│   │   ├── sockets/          # Socket.IO gateways
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Entry point
│   ├── migrations/           # TypeORM migrations
│   └── uploads/              # Uploaded images
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, OTP, callback, setup
│   │   │   ├── chat/         # Chat layout & conversations
│   │   │   └── profile/      # User profile page
│   │   ├── components/
│   │   │   └── chat/         # All chat UI components
│   │   ├── hooks/            # useSocket, useAuth
│   │   ├── services/         # API wrapper functions
│   │   ├── store/            # Zustand state stores
│   │   ├── lib/              # Axios client, Socket singleton
│   │   └── types/            # TypeScript interfaces
│   └── public/
│
└── database/
    └── schema.sql            # PostgreSQL schema
```

### OOP Class-Based Pattern
The backend follows a strict layered architecture:
```
Controllers → Services → Repositories → Entities
```
Every module has its own Controller, Service, Repository, and Entity class — keeping concerns separated and code maintainable.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (local) or Neon (cloud)
- Gmail account with App Password
- Google Cloud project with OAuth 2.0 credentials

### 1. Clone the repository
```bash
git clone https://github.com/Rabin-Pant/Chat-App.git
cd Chat-App
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
# Create .env.local with your local URLs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=your_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (Gmail + App Password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Generate JWT secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🗄️ Database Setup

### Option 1 — Import schema directly
```bash
psql -U your_user -d your_database -f database/schema.sql
```

### Option 2 — Run TypeORM migrations
```bash
cd backend
npm run migration:run
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/request` | Send OTP to email |
| POST | `/api/auth/otp/verify` | Verify OTP, get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google` | Google OAuth redirect |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/me/privacy` | Update last seen privacy |
| GET | `/api/users/search?q=` | Search users |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get all conversations |
| POST | `/api/chat/conversations/dm/:userId` | Start DM |
| GET | `/api/chat/conversations/:id/messages` | Get messages |
| POST | `/api/chat/conversations/:id/messages` | Send message |
| PUT | `/api/chat/conversations/:id/read` | Mark as read |
| DELETE | `/api/chat/conversations/:id/clear` | Clear conversation |
| DELETE | `/api/chat/messages/:id/soft` | Delete for me |
| DELETE | `/api/chat/messages/:id/hard` | Delete for everyone |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group details |
| PUT | `/api/groups/:id` | Update group |
| GET | `/api/groups/search?q=` | Search your groups |
| POST | `/api/groups/:id/members/:userId` | Add member |
| DELETE | `/api/groups/:id/members/:userId` | Remove member |

### Reactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reactions/:messageId` | Add reaction |
| DELETE | `/api/reactions/:messageId` | Remove reaction |
| GET | `/api/reactions/:messageId` | Get reactions |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/read` | Mark one as read |
| DELETE | `/api/notifications` | Delete all |
| DELETE | `/api/notifications/:id` | Delete one |

### Blocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blocks/:userId` | Block user |
| DELETE | `/api/blocks/:userId` | Unblock user |
| GET | `/api/blocks` | Get blocked users |

---

## ⚡ Socket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join:conversation` | `conversationId` | Join a conversation room |
| `leave:conversation` | `conversationId` | Leave a conversation room |
| `typing:start` | `conversationId` | Started typing |
| `typing:stop` | `conversationId` | Stopped typing |
| `message:read` | `conversationId` | Marked messages as read |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message:receive` | `Message` | New message received |
| `message:deleted` | `{messageId, type}` | Message was deleted |
| `message:read` | `{conversationId, userId}` | Someone read messages |
| `typing:start` | `{userId, conversationId}` | Someone is typing |
| `typing:stop` | `{userId, conversationId}` | Someone stopped typing |
| `presence:update` | `{userId, isOnline}` | User online status changed |
| `reaction:update` | `{messageId, reactions}` | Reactions updated |
| `notification:new` | `Notification` | New notification |
| `unread:update` | `{unreadCounts}` | Unread counts updated |
| `conversation:show` | — | Conversation became visible again |

---

## 🚢 Deployment

This app is deployed using:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [Neon](https://neon.tech)

### Deploy Backend (Render)
1. Connect GitHub repo
2. Set Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/server.js`
5. Add all environment variables

### Deploy Frontend (Vercel)
1. Connect GitHub repo
2. Set Root Directory: `frontend`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`

---

## 🗺️ Roadmap

- [ ] Voice messages
- [ ] Video calling
- [ ] Message search
- [ ] File sharing (PDF, docs)
- [ ] Push notifications (PWA)
- [ ] Message pinning in groups
- [ ] Admin dashboard

---

<div align="center">
Built with ❤️ by <a href="https://github.com/Rabin-Pant">Rabin Pant</a>
</div>