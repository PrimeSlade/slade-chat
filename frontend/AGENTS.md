# AI INSTRUCTIONS

Role: You are a Senior Frontend Engineer specializing in Next.js and TypeScript.
Constraint: You must strictly adhere to the "Integration Patterns" defined below.
Critical Rule: All Data Fetching (GET) must follow the `API → Hook → App` pattern.
Critical Rule: All Mutations (POST/PUT/DELETE) must follow the `API → Hook → App` pattern by default.

## Approval Gate (Required)

Before making any file changes, Codex must:

1. Inspect and explain the proposed changes.
2. Show the exact files it plans to modify.
3. Ask: "Proceed with these edits?"
4. Wait for explicit user approval (`yes` or `approved`) before writing.

Do not call `apply_patch`, write files, or run code-modifying commands until approval is received.

No-write mode by default: read-only unless the user explicitly says `apply it`.

# Frontend Architecture

## Core Technologies

### Language

- **TypeScript** - Type-safe JavaScript for enhanced developer experience and code reliability

### Framework

- **Next.js** - React framework with server-side rendering, routing, and optimizations

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built on Radix UI and Tailwind

### Theme

- **Design System**: Black and white minimalist
- High contrast, clean interface focusing on content and functionality
- Minimal color palette for professional appearance

## Real-time Communication

- **Socket.io** - WebSocket library for bidirectional event-based communication

## Authentication

- **Better Auth** - Modern authentication solution with secure session management

## Architecture Pattern

### Integration Pattern: API → Hook → App

```
┌─────────────────────────────────────────────┐
│ API Layer (lib/api)                         │
│ - HTTP requests                             │
│ - Socket.io connections                     │
│ - API client functions                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Hook Layer (hooks/)                         │
│ - Custom React hooks                        │
│ - State management                          │
│ - Business logic                            │
│ - Data transformation                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ App Layer (app/, components/)               │
│ - UI components                             │
│ - Pages and routes                          │
│ - User interactions                         │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities

#### API Layer (`lib/api`)

- Handles all external communication
- Manages HTTP requests and responses
- Establishes and maintains Socket.io connections
- Defines API endpoints and request methods

#### Hook Layer (`hooks/`)

- Consumes API layer functions
- Manages component state and side effects
- Implements business logic and data processing
- Provides clean interface for UI components
- Handles loading states, errors, and caching

#### App Layer (`app/` & `components/`)

- Consumes hooks for data and functionality
- Focuses purely on UI rendering and user interactions
- Implements Next.js routing and layouts
- Composes shadcn/ui components with custom components

### Default: Mutations

**For mutation operations (POST, PUT, DELETE), use API → Hook → App by default:**

```
┌─────────────────────────────────────────────┐
│ API Layer (lib/api)                         │
│ - POST, PUT, DELETE requests                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Hook Layer (hooks/)                         │
│ - useMutation and mutation orchestration    │
│ - Loading/error/success handling            │
│ - Cache invalidation/update policy          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ App Layer (app/, components/)               │
│ - Trigger hook mutation handlers            │
│ - Render mutation state                     │
└─────────────────────────────────────────────┘
```

**Why use hooks for mutations by default?**

- Keeps request state and side effects consistent across screens
- Centralizes invalidation/update logic for TanStack cache
- Prevents duplicated error/loading/retry handling in UI components

**Narrow exception (allowed):**

- `API → App` is allowed only for trivial, one-off UI actions with no shared state or cache invalidation impact.

### Benefits of This Pattern

- **Separation of Concerns**: Each layer has a clear, single responsibility
- **Reusability**: Hooks and API functions can be shared across components
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes in one layer minimize impact on others
- **Type Safety**: TypeScript ensures type consistency across all layers
- **Consistency**: Queries and mutations follow one primary integration model

## Project Structure

```
frontend/
├── app/                  # Next.js app router pages
├── components/           # Reusable UI components (shadcn/ui + custom)
├── hooks/               # Custom React hooks (for queries/subscriptions)
├── lib/                 # Utilities and API clients
│   └── api/            # API layer implementations
├── contexts/            # React contexts for global state
└── public/              # Static assets
```

## Development Guidelines

### Data Fetching & Queries

- All GET requests should go through: **API → Hook → App**
- Hooks encapsulate loading states, caching, and refetching logic
- Components consume hooks for reactive data

### Mutations

- POST, PUT, DELETE requests should go through: **API → Hook → App** (default)
- Use hooks to manage mutation state, retries, and invalidation/update behavior
- Allow direct **API → App** only for trivial one-off actions with no shared cache/state effects

### Code Standards

- Use TypeScript strictly - avoid `any` types if possible but don't edit existing 'any' types
- Follow minimalist black and white theme throughout
- Keep components focused on presentation
- Extract reusable logic into hooks (for queries)
- Maintain clear separation between layers
