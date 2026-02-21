# AI INSTRUCTIONS

Role: You are a Senior Backend Engineer specializing in NestJS.
Constraint: You must strictly adhere to the layered architecture defined below.
Critical Rule: Never allow Controllers to talk to Prisma directly.
Critical Rule: Never allow Repositories to contain business logic.

# Backend Architecture

## Core Technologies

### Framework

- **NestJS** - Progressive Node.js framework with TypeScript support, dependency injection, and modular architecture

### Database

- **PostgreSQL** - Relational database for persistent data storage
- **Prisma ORM** - Type-safe database client with schema migration and query building

### Caching

- **Redis** - In-memory data store for caching and session management
- **@nestjs/cache-manager** - NestJS integration for cache management with Redis adapter

### Real-time Communication

- **Socket.io** - WebSocket library for bidirectional event-based communication
- **@nestjs/websockets** - NestJS integration for WebSocket gateways

### Authentication

- **Better Auth** - Modern authentication solution with secure session management
- **@thallesp/nestjs-better-auth** - NestJS integration for Better Auth
- **Bcrypt** - Password hashing and encryption

### Validation & Types

- **Zod** - TypeScript-first schema validation for DTOs
- **Prisma Types** - Auto-generated types from database schema

### Additional Features

- **@nestjs/event-emitter** - Event-driven architecture for decoupled components
- **@google/genai** - Google Generative AI integration
- **@nestjs/swagger** - API documentation generation
- **@nestjs/schedule** - Task scheduling and cron jobs
- **Jose** - JWT operations and verification

---

## Architecture Layers

### Three-Layer Pattern: Repository → Service → Controller

```
┌─────────────────────────────────────────────┐
│ Controller Layer                            │
│ - Request/Response handling                 │
│ - Input validation (Zod)                    │
│ - Route definitions                         │
│ - Guards, Interceptors                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Service Layer                               │
│ - Business logic                            │
│ - Transaction management                    │
│ - Error handling                            │
│ - Event emission                            │
│ - Service orchestration                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Repository Layer                            │
│ - Prisma queries                            │
│ - Database operations                       │
│ - Raw SQL (if needed)                       │
│ - Transaction support                       │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Repository Layer (`*.repository.ts`)

**What it does:**

- Direct interaction with Prisma client
- CRUD operations and complex queries
- Accepts optional transaction client for transactional operations
- Returns Prisma types or custom types from `@backend/src/shared/`

**What it doesn't do:**

- Business logic or validation
- Error transformation (only database errors)
- Event emission

**Example:**

```typescript
@Injectable()
export class MessagesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(
    data: { content: string; senderId: string; roomId: string },
    trx?: Prisma.TransactionClient,
  ): Promise<MessageWithSender> {
    const prisma = trx || this.prismaService;
    return prisma.message.create({
      data,
      include: { sender: true },
    });
  }
}
```

#### Service Layer (`*.service.ts`)

**What it does:**

- Implements business logic and rules
- Orchestrates multiple repository calls
- Manages Prisma transactions using `$transaction()`
- **Handles all error cases and transformations**
- Emits events using EventEmitter2
- Validates business rules

**What it doesn't do:**

- HTTP-specific logic (status codes, headers)
- Request parsing or response formatting

**Example:**

```typescript
@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMessage(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<MessageWithSender> {
    // Business logic here
    const message = await this.messagesRepository.createMessage(data);

    // Event emission
    this.eventEmitter.emit('message_created', message.roomId, message);

    return message;
  }

  // Error handling example
  async updateMessage(data: UpdateMessageDto, senderId: string) {
    const message = await this.messagesRepository.getMessageByMessageId(
      data.messageId,
    );

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== senderId) {
      throw new ForbiddenException('Not authorized to update this message');
    }

    return this.messagesRepository.updateMessage(data, senderId);
  }
}
```

#### Controller Layer (`*.controller.ts`)

**What it does:**

- Defines HTTP routes and methods
- Validates request input using Zod schemas
- Applies guards for authentication/authorization
- Calls service methods
- Formats responses using `ControllerResponse<T>` type
- Applies interceptors

**What it doesn't do:**

- Business logic
- Direct database access
- Error handling (handled by filters)

**Example:**

```typescript
@UseGuards(HttpRoomGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('room/:roomId')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query(new ZodValidationPipe(getMessagesBodySchema))
    query: GetMessagesBodyDto,
  ): Promise<ControllerResponse<MessageWithSender[]>> {
    const { messages, nextCursor } = await this.messagesService.getMessages({
      roomId,
      ...query,
    });

    return {
      data: messages,
      meta: { nextCursor },
    };
  }
}
```

---

## Cross-Cutting Concerns

### Filters (`src/common/filters/`)

Handle exceptions and transform them into appropriate HTTP responses.

**Available Filters:**

- `all-exceptions.filter.ts` - Catches all unhandled exceptions
- `http-exception.filter.ts` - Handles NestJS HTTP exceptions
- `prisma-client-exception.filter.ts` - Transforms Prisma errors to HTTP errors

**Usage:**

```typescript
// Applied globally in main.ts
app.useGlobalFilters(
  new AllExceptionsFilter(),
  new HttpExceptionFilter(),
  new PrismaClientExceptionFilter(),
);
```

### Guards (`src/common/guards/`)

Protect routes and determine if a request should be handled.

**Available Guards:**

- `http-room.guard.ts` - Validates user access to rooms in HTTP requests
- `message-sender.guard.ts` - Validates message ownership
- `ws-rooms.guard.ts` - Validates user access to rooms in WebSocket connections

**Usage:**

```typescript
@UseGuards(HttpRoomGuard)
@Controller('messages')
export class MessagesController { ... }
```

### Interceptors (`src/common/interceptors/`)

Transform responses or add additional logic.

**Available Interceptors:**

- `response.interceptor.ts` - Standardizes response format

### Pipes (`src/common/pipes/`)

Transform and validate input data.

**Zod Validation Pipe:**

```typescript
@Query(new ZodValidationPipe(getMessagesBodySchema))
query: GetMessagesBodyDto
```

---

## Type System

### Type Architecture

The backend uses a **two-type system** with Prisma types as the source of truth:

```
┌─────────────────────────────────────────────┐
│ Prisma Schema (prisma/schema.prisma)       │
│ - Database schema definition                │
└─────────────────┬───────────────────────────┘
                  │ Generate
                  ▼
┌─────────────────────────────────────────────┐
│ Generated Prisma Types                      │
│ (generated/prisma/client)                   │
│ - Base model types                          │
│ - Prisma.Payload<> utility types            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ @backend/src/shared/{module}/types.ts       │
│ - Re-export Prisma types                    │
│ - Custom types using Prisma.Payload<>       │
│ - Modified types based on queries           │
└─────────────────────────────────────────────┘
```

### Shared Types (`@backend/src/shared/`)

Structure:

```
src/shared/
├── index.ts                    # Barrel export
├── messages/
│   ├── types.ts               # Prisma-based types
│   └── zodSchemas.ts          # Zod validation schemas
├── rooms/
│   ├── types.ts
│   └── zodSchemas.ts
└── users/
    ├── types.ts
    └── zodSchemas.ts
```

#### Types (`types.ts`)

Based on Prisma schema and modified for specific query shapes:

```typescript
// Re-export base Prisma type
export type { Message } from 'generated/prisma/client';

// Custom type for query that includes relations
export type MessageWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: true;
  };
}>;
```

#### Zod Schemas (`zodSchemas.ts`)

Define DTOs and validation rules:

```typescript
// Service/Repository DTO
export const createMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().max(2000),
});

// Controller DTO (omits params from route)
export const createMessageBodySchema = createMessageSchema.omit({
  roomId: true,
});

// Infer TypeScript types from Zod schemas
export type CreateMessageDto = z.infer<typeof createMessageSchema>;
export type CreateMessageBodyDto = z.infer<typeof createMessageBodySchema>;
```

### Type Flow Through Layers

```
Controller → Service → Repository → Database
   ↓           ↓          ↓
BodyDto     FullDto   PrismaTypes
(Zod)       (Zod)     (Prisma)
```

**Example:**

1. **Controller** receives `CreateMessageBodyDto` (no roomId)
2. **Controller** adds roomId from params → `CreateMessageDto`
3. **Service** validates and passes to repository
4. **Repository** uses Prisma types, returns `MessageWithSender`

---

## Module Structure

### Standard Module Pattern

Each feature module follows this structure:

```
src/{module}/
├── {module}.module.ts          # NestJS module definition
├── {module}.controller.ts      # HTTP routes
├── {module}.service.ts         # Business logic
├── {module}.repository.ts      # Database operations
├── entities/                   # Prisma entities (if needed)
└── dto/                        # Legacy DTOs (prefer shared/)
```

### Example: Messages Module

```typescript
// messages.module.ts
@Module({
  imports: [CommonModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
  exports: [MessagesService], // Export for use in other modules
})
export class MessagesModule {}
```

**Key Points:**

- Repository is only used by Service (not exported)
- Service is exported for use in other modules (e.g., ChatGateway)
- Controller only interacts with Service
- Common module provides shared guards, filters, interceptors

---

## Chat Module Architecture

### WebSocket Gateway Pattern

The chat module implements real-time communication using Socket.io:

```
src/chat/
├── chat.module.ts              # Module definition
├── chat.gateway.ts             # WebSocket gateway
└── guards/                     # WebSocket-specific guards
```

### Gateway Structure (`chat.gateway.ts`)

```typescript
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Lifecycle hooks
  afterInit(server: Server) { ... }
  handleConnection(socket: Socket) { ... }
  handleDisconnect(socket: Socket) { ... }

  // Event listeners
  @UseGuards(WsRoomGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(...) { ... }

  // Event emitters
  @OnEvent('message_created')
  handleMessageCreated(roomId: string, message: MessageWithSender) {
    this.server.to(roomId).emit('new_message', message);
  }
}
```

### Gateway Responsibilities

**What it does:**

- Handles WebSocket connections and disconnections
- Validates JWT tokens in middleware
- Manages room subscriptions (join/leave)
- Listens to events from EventEmitter2
- Broadcasts events to connected clients
- Integrates with services for business logic

**What it doesn't do:**

- Direct database access (uses services)
- Business logic (delegates to services)
- Complex error handling (uses filters)

### Authentication Flow

```
1. Client connects with JWT token in socket.handshake.auth
2. Gateway middleware validates token using Jose
3. User data stored in socket.data.user
4. Guards check permissions for each event
5. Cache stores user-socket mappings
```

### Event Flow

```
HTTP Request → Service → Event Emission
                            ↓
                    EventEmitter2
                            ↓
                    Gateway Listener
                            ↓
                Socket.io Broadcast
                            ↓
                    Connected Clients
```

**Example:**

```typescript
// Service emits event
this.eventEmitter.emit('message_created', message.roomId, message);

// Gateway listens and broadcasts
@OnEvent('message_created')
handleMessageCreated(roomId: string, message: MessageWithSender) {
  this.server.to(roomId).emit('new_message', message);
}
```

### Room Management

- Users join rooms via `socket.join(roomId)`
- Guards validate room access before joining
- Messages broadcast to room: `this.server.to(roomId).emit(...)`
- User tracking via Redis cache

---

## Transaction Management

### Service Layer Transactions

The service layer manages all Prisma transactions:

```typescript
async complexOperation(data: ComplexDto): Promise<Result> {
  return this.prismaService.$transaction(async (trx) => {
    // All repository calls use the same transaction
    const step1 = await this.repo1.create(data.part1, trx);
    const step2 = await this.repo2.update(data.part2, trx);
    const step3 = await this.repo3.delete(data.part3, trx);

    return { step1, step2, step3 };
  });
}
```

### Repository Transaction Support

Repositories accept optional transaction client:

```typescript
async createMessage(
  data: MessageData,
  trx?: Prisma.TransactionClient,
): Promise<Message> {
  const prisma = trx || this.prismaService;
  return prisma.message.create({ data });
}
```

---

## Error Handling

### Error Flow

```
Repository → Service → Filter → Client
    ↓          ↓         ↓
Prisma    Transform   Format
Errors    to HTTP     Response
```

### Service Layer Error Handling

All business logic errors are thrown in the service layer:

```typescript
// Not Found
if (!resource) {
  throw new NotFoundException('Resource not found');
}

// Forbidden
if (resource.ownerId !== userId) {
  throw new ForbiddenException('Access denied');
}

// Bad Request
if (invalidCondition) {
  throw new BadRequestException('Invalid input');
}

// Conflict
if (duplicateExists) {
  throw new ConflictException('Resource already exists');
}
```

### Filter Transformations

Filters catch exceptions and transform them:

```typescript
// Prisma errors → HTTP errors
PrismaClientKnownRequestError: P2025 → NotFoundException
PrismaClientKnownRequestError: P2002 → ConflictException

// NestJS exceptions → Formatted response
HttpException → { statusCode, message, error }
```

---

## Development Guidelines

### Layer Rules

#### Repository Layer ✓ Can / ✗ Cannot

✓ **Can:**

- Use Prisma client methods
- Write raw SQL if needed
- Accept transaction client
- Return Prisma types or shared types
- Throw Prisma errors

✗ **Cannot:**

- Contain business logic
- Validate business rules
- Transform exceptions
- Emit events
- Call other services

#### Service Layer ✓ Can / ✗ Cannot

✓ **Can:**

- Implement business logic
- Validate business rules
- Call multiple repositories
- Manage transactions
- Emit events via EventEmitter2
- Transform data
- Throw HTTP exceptions
- Call other services

✗ **Cannot:**

- Access Prisma directly (use repository)
- Handle HTTP-specific logic
- Format responses

#### Controller Layer ✓ Can / ✗ Cannot

✓ **Can:**

- Define routes
- Validate input with Zod
- Apply guards and interceptors
- Call service methods
- Format responses
- Extract params/query/body

✗ **Cannot:**

- Contain business logic
- Access repositories directly
- Handle exceptions (use filters)
- Emit events

### Code Standards

- **TypeScript Strict Mode**: Enabled
- **No `any` types**: Use proper typing
- **Export shared types**: From `@backend/src/shared/`
- **Zod for validation**: All DTOs use Zod schemas
- **Prisma for queries**: Never use raw SQL unless necessary
- **Error handling in services**: Always validate and throw appropriate exceptions
- **Test coverage**: Write unit tests for services and integration tests for controllers

### Best Practices

1. **Keep repositories thin**: Only database operations
2. **Keep controllers thin**: Only request/response handling
3. **Keep services focused**: Single responsibility per service
4. **Use transactions wisely**: Only when needed for data consistency
5. **Emit events for side effects**: Decouple modules using EventEmitter2
6. **Cache strategically**: Use Redis for frequently accessed data
7. **Validate early**: Use guards and pipes at the controller level
8. **Type everything**: Leverage TypeScript and Prisma types fully

---

## Project Structure Overview

```
backend/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Application entry point
│   ├── prisma.service.ts          # Prisma service
│   ├── prisma.module.ts           # Prisma module
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Authorization guards
│   │   ├── interceptors/          # Response interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   └── types/                 # Common types
│   │
│   ├── shared/                    # Shared types and schemas
│   │   ├── index.ts               # Barrel exports
│   │   ├── messages/
│   │   │   ├── types.ts           # Prisma-based types
│   │   │   └── zodSchemas.ts      # Zod schemas & DTOs
│   │   ├── rooms/
│   │   └── users/
│   │
│   ├── chat/                      # WebSocket module
│   │   ├── chat.gateway.ts        # Socket.io gateway
│   │   ├── chat.module.ts
│   │   └── guards/
│   │
│   ├── messages/                  # Messages module
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   ├── messages.repository.ts
│   │   └── messages.module.ts
│   │
│   ├── rooms/                     # Rooms module
│   │   ├── rooms.controller.ts
│   │   ├── rooms.service.ts
│   │   ├── rooms.repository.ts
│   │   └── rooms.module.ts
│   │
│   └── users/                     # Users module
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.repository.ts
│       └── users.module.ts
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
│
└── generated/
    └── prisma/
        └── client/                # Generated Prisma types
```

---

## Summary

This backend architecture provides:

- **Clear separation of concerns** across Repository, Service, and Controller layers
- **Type safety** using Prisma-generated types and Zod validation
- **Error handling** centralized in service layer with global filters
- **Real-time capabilities** via Socket.io WebSocket gateway
- **Scalability** through modular design and caching with Redis
- **Maintainability** with consistent patterns and development workflow
- **Testability** with dependency injection and layer separation
