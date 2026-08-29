# Slade Chat

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socketdotio)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?logo=redis)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm)](https://pnpm.io/)
[![Status](https://img.shields.io/badge/Status-Under%20Active%20Development-orange?style=flat-square)](#project-status--roadmap)

A high-performance, real-time messaging and collaborative chat platform built with modern full-stack web technologies. Engineered as a **pnpm monorepo** uniting a **Next.js 16 (React 19)** web application with a modular **NestJS 11** API micro-architecture, powered by **Socket.IO WebSockets**, **Redis** presence caching, **Prisma ORM**, and **Better Auth** session security.

---

> [!WARNING]
> ### Project Status: Under Active Development
> This repository is currently in active development (Alpha / WIP). Core real-time messaging, direct/group chats, presence, typing indicators, and authentication are functional, while high-cardinality friend graphs, attachment uploads, and AI chat integrations are actively being developed.

---

## Table of Contents

- [Project Status & Roadmap](#project-status--roadmap)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Monorepo Project Structure](#monorepo-project-structure)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Development Servers](#running-development-servers)
  - [Docker Setup](#docker-setup)
- [Available Monorepo Scripts](#available-monorepo-scripts)
- [Architecture & Design Patterns](#architecture--design-patterns)
  - [Frontend Architecture (API → Hook → App)](#frontend-architecture-api--hook--app)
  - [Backend Architecture (Repo → Service → Controller)](#backend-architecture-repo--service--controller)
  - [Real-Time WebSocket & Presence Lifecycle](#real-time-websocket--presence-lifecycle)
- [License](#license)

---

## Project Status & Roadmap

| Feature / Area | Status | Notes |
| :--- | :---: | :--- |
| **Monorepo Workspace Setup** | Completed | Root pnpm workspace with `apps/api` and `apps/web` |
| **Authentication & Sessions** | Completed | Better Auth, JWT/JWKS verification, secure cookie sessions, Google OAuth |
| **Real-time Messaging** | Completed | Socket.IO bi-directional events, room joins/leaves, broadcasts |
| **Direct & Group Chats** | Completed | 1-on-1 direct conversations and multi-member group chat rooms |
| **Typing Indicators** | Completed | Real-time broadcast when conversation participants are typing |
| **Read Receipts & Seen Tracking** | Completed | Per-message and per-room participant `lastReadAt` tracking |
| **Online / Offline Presence** | Completed | Redis multi-connection counter & last seen timestamping |
| **Nested Replies & Threading** | Completed | Parent-child message replies support in data model |
| **Friendship Graph Optimizations** | In Progress | Narrow `FriendshipReadPort` & candidate lookup queries (`apps/api/docs/scaling-todos.md`) |
| **AI Assistant / Smart Chat** | In Progress | `@google/genai` Gemini SDK integration for smart chat assistance |
| **Media & File Attachments** | Planned | Multipart uploads with S3/cloud storage integration |
| **Push Notifications** | Planned | Web Push API & background notification dispatch |

---

## Key Features

### Real-Time Messaging & Rooms
- **Direct Messaging (1:1):** Instant private conversations with friend relationship validation.
- **Group Chat Rooms:** Create rooms, add members, customize room details, and manage group participants.
- **Event-Driven Broadcasting:** Powered by NestJS `EventEmitter2` and Socket.IO gateways to isolate message creation from WebSocket transport.

### Presence & Activity Tracking
- **Live User Presence:** Instant online/offline status broadcast across friend graphs.
- **Redis Multi-Device Counter:** Tracks multi-tab and multi-device socket connections reliably without race conditions.
- **Typing Indicators:** Lightweight broadcast of active typing state to other room members.
- **Granular Read Receipts:** Real-time update of participant read timestamps (`lastReadAt`) and per-message seen avatars.

### Enterprise Authentication & Security
- **Better Auth Integration:** Modern session management supporting password credentials and Google Social OAuth.
- **JWT & Remote JWKS:** WebSockets authenticate via remote JWKS verification using `jose` library.
- **Route & WebSocket Guards:** `HttpRoomGuard`, `WsRoomGuard`, and `MessageSenderGuard` prevent unauthorized room or message tampering.

### Minimalist UI & Experience
- **Black & White High-Contrast Theme:** Clean, content-focused dark/light aesthetic built on Tailwind CSS v4 and Radix UI primitives.
- **Optimistic Caching:** TanStack React Query v5 with optimistic UI updates and instant cache invalidation.
- **Responsive Layout:** Adaptive desktop sidebar and mobile chat views.

---

## Technology Stack

### Monorepo & Core Tooling
| Tool | Purpose | Version |
| :--- | :--- | :--- |
| **[pnpm](https://pnpm.io/)** | High-efficiency workspace package manager | `v10+` |
| **[TypeScript](https://www.typescriptlang.org/)** | End-to-end type safety across backend and frontend | `v5.8` |
| **[ESLint 9](https://eslint.org/) & [Prettier](https://prettier.io/)** | Code quality, linting, and formatting | Latest |
| **[Docker & Compose](https://www.docker.com/)** | Containerized backend services & testing databases | Latest |

### Frontend (`apps/web`)
| Layer / Library | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss`, `tw-animate-css` |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) patterns |
| **State & Data Fetching** | [@tanstack/react-query v5](https://tanstack.com/query) |
| **Real-time Client** | [Socket.io Client v4](https://socket.io/docs/v4/client-api/) |
| **Authentication Client** | [Better Auth Client](https://www.better-auth.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |

### Backend API (`apps/api`)
| Layer / Library | Technology |
| :--- | :--- |
| **Framework** | [NestJS 11](https://nestjs.com/) (Modular architecture with Dependency Injection) |
| **ORM & Database** | [Prisma ORM 6](https://www.prisma.io/) + [PostgreSQL 16+](https://www.postgresql.org/) |
| **In-Memory & Cache** | [Redis](https://redis.io/) + `@keyv/redis` + `@nestjs/cache-manager` + `cacheable` |
| **WebSockets** | `@nestjs/websockets` + [Socket.IO](https://socket.io/) Gateway |
| **Auth & Cryptography** | [Better Auth](https://www.better-auth.com/) (`@thallesp/nestjs-better-auth`), `jose`, `bcrypt` |
| **Validation** | [Zod 4](https://zod.dev/) request DTO schemas & custom validation pipes |
| **Event Bus** | `@nestjs/event-emitter` (`EventEmitter2`) |
| **AI Integration** | [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK) |
| **Testing** | [Jest](https://jestjs.io/), `supertest`, `ts-jest` (Unit, E2E & Integration suites) |

---

## System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend Client (apps/web)"]
        UI["UI Layer (Next.js 16 + React 19 + shadcn/ui)"]
        Hooks["Hook Layer (useMessages, useRooms, useSocket)"]
        APILayer["API Layer (HTTP Axios & Socket.IO Client)"]
        AuthClient["Better Auth Client"]
    end

    subgraph Backend ["Backend API & Gateway (apps/api)"]
        MainGateway["Socket.IO ChatGateway (/chat namespace)"]
        Controllers["HTTP Controllers (/api/messages, /api/rooms, /api/users)"]
        Guards["Guards (HttpRoomGuard, WsRoomGuard, MessageSenderGuard)"]
        Services["Service Layer (MessagesService, RoomsService, UsersService)"]
        EventBus["EventEmitter2 (message_created, room_created, user_status)"]
        Repos["Repository Layer (MessagesRepo, RoomsRepo, UsersRepo)"]
    end

    subgraph Storage ["Data & Cache Infrastructure"]
        Postgres[(PostgreSQL Database)]
        RedisCache[(Redis Presence & Caching)]
        Prisma["Prisma ORM Client"]
    end

    UI --> Hooks
    Hooks --> APILayer
    APILayer -->|HTTP REST Requests| Controllers
    APILayer -->|Bi-Directional WebSockets| MainGateway
    AuthClient -->|Session Auth| Controllers

    Controllers --> Guards
    Guards --> Services
    MainGateway --> Services
    Services --> EventBus
    EventBus -->|Async Events| MainGateway
    Services --> Repos
    Repos --> Prisma
    Prisma --> Postgres
    MainGateway -->|Connection Counters & Last Seen| RedisCache
    Services -->|Cache Lookup & Invalidation| RedisCache
```

---

## Monorepo Project Structure

```
slade-chat/
├── apps/
│   ├── api/                           # NestJS Backend API & WebSocket Gateway (@chat/api)
│   │   ├── src/
│   │   │   ├── chat/                  # Socket.IO WebSocket Gateway & Handlers
│   │   │   │   ├── chat.gateway.ts    # Connection, typing, seen, room events
│   │   │   │   └── chat.module.ts
│   │   │   ├── common/                # Cross-cutting guards, filters, interceptors, pipes
│   │   │   │   ├── decorators/        # Custom Nest decorators (@Public)
│   │   │   │   ├── filters/           # Global exception & Prisma error filters
│   │   │   │   ├── guards/            # HTTP & WS room authorization guards
│   │   │   │   ├── helpers/           # Friendship, hash, and soft delete helpers
│   │   │   │   ├── interceptors/      # Standard response interceptor
│   │   │   │   └── pipes/             # Zod validation pipe
│   │   │   ├── lib/
│   │   │   │   └── auth.ts            # Better Auth configuration & adapter
│   │   │   ├── messages/              # Messages module (Controller, Service, Repository)
│   │   │   ├── rooms/                 # Rooms module (Controller, Service, Repository)
│   │   │   ├── users/                 # Users & Friends module
│   │   │   ├── shared/                # Shared DTOs, Zod schemas, & Prisma types
│   │   │   ├── app.module.ts          # Root NestJS application module
│   │   │   └── main.ts                # Application bootstrap & middleware
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # PostgreSQL database schema
│   │   │   ├── migrations/            # Database migrations history
│   │   │   └── seed.ts                # Database seed script
│   │   ├── test/                      # Unit, integration, and E2E test suites
│   │   ├── Dockerfile                 # Development container definition
│   │   ├── Dockerfile.test            # Test runner container
│   │   ├── docker-compose.yml         # Local Docker Compose setup
│   │   ├── docker-compose.test.yml    # Isolated test database compose setup
│   │   ├── .env.example               # Backend environment template
│   │   └── package.json
│   │
│   └── web/                           # Next.js 16 Frontend Web Application (@chat/web)
│       ├── app/                       # App Router routes & layouts
│       │   ├── (auth)/login/          # Authentication & login pages
│       │   ├── (protected)/           # Protected application routes
│       │   │   ├── (people)/          # Friends & Strangers discovery views
│       │   │   ├── chat/              # Chat room & DM conversation views
│       │   │   │   ├── [roomId]/      # Room conversation page
│       │   │   │   └── dm/[userId]/   # Direct message initiator
│       │   │   └── layout.tsx         # Main authenticated shell
│       │   ├── providers/             # TanStack Query, Theme, & Socket providers
│       │   └── layout.tsx             # Root HTML layout
│       ├── components/                # UI Components
│       │   ├── chat-list/             # Conversation list & active chat item
│       │   ├── chat-window/           # Message viewport, header, & chat input
│       │   ├── message/               # Message bubble, action menu, seen avatars
│       │   ├── navbar/                # Navigation header & actions
│       │   ├── people/                # Friend cards & request actions
│       │   ├── sidebar/               # Main desktop sidebar navigation
│       │   └── ui/                    # Reusable shadcn/ui primitives
│       ├── hooks/                     # Custom data & mutation hooks (API → Hook → App)
│       │   ├── use-messages.ts        # Message fetching, sending, & pagination
│       │   ├── use-rooms.ts           # Room lists, creation, & updates
│       │   ├── use-socket.ts          # Socket.IO connection & event subscription
│       │   ├── use-friends.ts         # Friend requests & status mutations
│       │   └── use-mark-as-seen.ts    # Intersection-based read receipt trigger
│       ├── lib/                       # API clients, axios instance, socket helper
│       ├── .env.example               # Frontend environment template
│       └── package.json
│
├── .gitignore                         # Monorepo root ignore rules
├── package.json                       # Monorepo root configuration & scripts
├── pnpm-workspace.yaml                # pnpm workspace definition (apps/*)
└── README.md                          # Comprehensive project documentation
```

---

## Quick Start Guide

### Prerequisites

Make sure the following dependencies are installed on your machine:
- **Node.js**: `v20.0.0` or higher (recommended: Node 22+)
- **pnpm**: `v10.0.0` or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL**: `v16+` (or a hosted PostgreSQL database)
- **Redis**: `v7+` (for presence tracking and caching)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PrimeSlade/slade-chat.git
   cd slade-chat
   ```

2. **Install all workspace dependencies:**
   ```bash
   pnpm install
   ```

---

### Environment Variables

Create `.env` files in both `apps/api` and `apps/web`:

#### Backend API (`apps/api/.env`):
```env
# Server
PORT=3001
NODE_ENV=development
BASE_URL="http://localhost:3001"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slade_chat?schema=public"

# Authentication
BETTER_AUTH_SECRET="your-super-secure-secret-key-at-least-32-characters"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI (Optional)
GEMINI_API_KEY="your-gemini-api-key"
```

#### Frontend (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
BETTER_AUTH_URL="http://localhost:3001"
```

---

### Database Setup

Run Prisma schema synchronization and generation:

```bash
# 1. Generate Prisma Client
pnpm db:generate

# 2. Run Database Migrations (or db:push for prototyping)
pnpm db:migrate

# 3. (Optional) Seed the database
pnpm seed
```

---

### Running Development Servers

Start both Frontend and Backend concurrently with one command:

```bash
# Run both web and api in parallel
pnpm dev
```

Or run each project individually:

```bash
# Start frontend only (http://localhost:3000)
pnpm dev:web

# Start backend only (http://localhost:3001)
pnpm dev:api
```

- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)
- **WebSocket Gateway:** `ws://localhost:3001/chat`

---

### Docker Setup

To spin up the backend stack with Docker:

```bash
# Start backend container
pnpm docker:up

# Tear down backend container
pnpm docker:down
```

For running isolated integration/e2e tests with test database:
```bash
cd apps/api
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

---

## Available Monorepo Scripts

Execute these scripts from the monorepo root:

| Command | Target | Description |
| :--- | :--- | :--- |
| `pnpm dev` | Root | Starts Frontend and Backend simultaneously in watch mode |
| `pnpm dev:web` | `apps/web` | Starts the Next.js dev server on port `3000` |
| `pnpm dev:api` | `apps/api` | Starts the NestJS API dev server on port `3001` with auto-reload |
| `pnpm build` | All | Builds both frontend and backend for production |
| `pnpm build:web` | `apps/web` | Builds the Next.js production bundle |
| `pnpm build:api` | `apps/api` | Compiles the NestJS application into `dist/` |
| `pnpm lint` | All | Runs ESLint checks across all packages |
| `pnpm test` | `apps/api` | Runs unit tests using Jest |
| `pnpm test:watch` | `apps/api` | Runs Jest in interactive watch mode |
| `pnpm test:integration` | `apps/api` | Executes integration tests against database |
| `pnpm test:e2e` | `apps/api` | Executes end-to-end API tests |
| `pnpm db:generate` | `apps/api` | Generates Prisma client types |
| `pnpm db:migrate` | `apps/api` | Runs Prisma schema migrations |
| `pnpm db:push` | `apps/api` | Pushes schema directly to database without creating a migration file |
| `pnpm db:studio` | `apps/api` | Opens Prisma Studio web data browser |
| `pnpm seed` | `apps/api` | Executes database seed script |
| `pnpm docker:up` | `apps/api` | Builds and launches backend Docker services |
| `pnpm docker:down` | `apps/api` | Stops backend Docker services |

---

## Architecture & Design Patterns

### Frontend Architecture (API → Hook → App)

The frontend strictly enforces a 3-layer data flow pattern for all queries and mutations:

```
┌────────────────────────────────────────────────────────┐
│ API Layer (lib/api)                                    │
│ - Raw HTTP requests via Axios                          │
│ - Socket.IO event listeners & emitters                 │
│ - Type-safe API methods                                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Hook Layer (hooks/)                                    │
│ - Custom React hooks (@tanstack/react-query)           │
│ - Mutation orchestration & cache invalidation          │
│ - Loading, error, & optimistic state handling          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ App Layer (app/ & components/)                         │
│ - Pure presentation & UI components                    │
│ - Page routing & layout structures                     │
│ - User event handlers triggering hook mutations        │
└────────────────────────────────────────────────────────┘
```

### Backend Architecture (Repo → Service → Controller)

The backend follows a strict 3-tier separation of concerns:

- **Repository Layer (`*.repository.ts`):** Only Prisma queries and raw database interactions. Accepts optional transaction clients (`Prisma.TransactionClient`).
- **Service Layer (`*.service.ts`):** Contains all business logic, authorization rules, transaction orchestration via `prisma.$transaction()`, error handling, and event emission (`EventEmitter2`).
- **Controller Layer (`*.controller.ts`):** HTTP routing, input validation via Zod schemas, guards (`HttpRoomGuard`), and standardized response wrapping.
- **WebSocket Gateway (`chat.gateway.ts`):** Listens to domain events from `EventEmitter2` and broadcasts real-time updates to connected Socket.IO rooms.

### Real-Time WebSocket & Presence Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User1 as User 1 (Client)
    participant GW as Socket.IO Gateway
    participant Redis as Redis Cache
    participant DB as PostgreSQL / Prisma
    actor User2 as User 2 (Friend / Room Member)

    User1->>GW: Connect with JWT token
    GW->>GW: Verify JWT via Remote JWKS
    GW->>Redis: Increment user:user1:count
    alt Connection count == 1 (User came online)
        GW->>User2: Emit 'user_status' { userId: User1, status: 'online' }
    end

    User1->>GW: 'join_room' { roomId }
    GW->>GW: WsRoomGuard verifies user room membership
    GW-->>User1: Joined room channel

    User1->>GW: 'user_typing' { roomId, userId }
    GW->>User2: Broadcast 'user_typing' to room members

    User1->>GW: 'mark_seen' { roomId, messageId }
    GW->>DB: Update room_participant lastReadAt
    GW->>User2: Broadcast 'user_read_update' { userId, lastReadAt }

    User1->>GW: Disconnect
    GW->>Redis: Decrement user:user1:count
    alt Connection count == 0 (User went offline)
        GW->>Redis: Set user:user1:last_seen timestamp
        GW->>User2: Emit 'user_status' { userId: User1, status: 'offline' }
    end
```

---

## License

This project is licensed under the [MIT License](LICENSE).
