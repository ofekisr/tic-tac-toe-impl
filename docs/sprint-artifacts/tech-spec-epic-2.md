# Epic Technical Specification: Game Session Management

Date: 2025-01-27
Author: ofeki
Epic ID: 2
Status: Final

---

## Overview

Epic 2: Game Session Management establishes the foundational WebSocket communication infrastructure and game session lifecycle management for the fusion-tic-tac-toe system. This epic enables players to create new game sessions, receive unique game codes, and join existing games via WebSocket connections. The implementation provides the core real-time communication protocol that all subsequent gameplay features depend upon. The epic delivers the WebSocket server setup using NestJS Gateway pattern, game code generation, game creation and joining workflows, message protocol implementation, validation, and connection management—all aligned with the distributed architecture requirements for multi-server synchronization.

## Objectives and Scope

**In-Scope:**
- WebSocket server setup using NestJS Gateway on ports 3001 (Server A) and 3002 (Server B)
- Unique game code generation (6 alphanumeric characters)
- Game creation workflow: client sends `{ type: 'join', gameCode: 'NEW' }`, server generates code and creates game state
- Game joining workflow: client sends `{ type: 'join', gameCode: 'ABC123' }`, server validates and assigns player (X or O)
- Player assignment: first player becomes 'X', second player becomes 'O'
- WebSocket message protocol: structured JSON messages (join, joined, update, error)
- Message validation: structure validation, required fields, game code existence
- Error handling: clear error messages for invalid requests (GAME_NOT_FOUND, GAME_FULL, INVALID_MESSAGE)
- Connection lifecycle management: handle connection/disconnection events
- Support for multiple concurrent game sessions
- Prevention of joining games that have already started (status = 'playing')

**Out-of-Scope:**
- Gameplay mechanics (moves, turn management, win/draw detection) - deferred to Epic 3
- Multi-server synchronization via Redis - deferred to Epic 4
- CLI client interface - deferred to Epic 3
- Game state persistence beyond active sessions (TTL-based cleanup only)
- Authentication or user management
- Game history or replay functionality

## System Architecture Alignment

This epic implements the Presentation and Application layers of the layered architecture, specifically the WebSocket Gateway (Presentation) and Game Service (Application) components. The implementation follows the NestJS Gateway pattern for WebSocket handling, enabling clean separation between connection management and business logic. Game state storage uses Redis (via IGameRepository interface), preparing for Epic 4's multi-server synchronization. The message protocol aligns with shared types in `packages/shared/src/types/messages.ts`, ensuring contract-first development. The architecture maintains stateless server design by storing all game state in Redis, enabling horizontal scaling and load balancing. Connection tracking maps WebSocket connections to game codes and player symbols, supporting the distributed architecture where clients may connect to different server instances.

## Detailed Design

### Services and Modules

**Presentation Layer:**

| Module/Service | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|--------|---------|-------|
| `GameGateway` | WebSocket connection management, message routing | WebSocket connections, client messages | Server messages (joined, update, error) | Presentation |
| `GameModule` | NestJS module configuration for game feature | - | Configured Gateway and services | Presentation |

**Application Layer:**

| Module/Service | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|--------|---------|-------|
| `GameService` | Game session business logic orchestration | Connection ID, game code, player symbol | Game state, game code | Application |
| `CreateGameUseCase` | Game creation workflow | Connection ID | GameDTO with game code | Application |
| `JoinGameUseCase` | Game joining workflow | Connection ID, game code | GameDTO, player assignment | Application |
| `MessageValidationService` | Message structure and content validation | Raw WebSocket message | Validation result, error codes | Application |

**Domain Layer:**

| Module/Service | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|--------|---------|-------|
| `GameCode` | Game code value object (6 alphanumeric) | - | Unique game code string | Domain |
| `Game` | Game entity with state management | Game code, board, status, players | Game state, DTO conversion | Domain |
| `IGameRepository` | Game state persistence interface | Game entity | Game entity, existence checks | Domain |

**Infrastructure Layer:**

| Module/Service | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|--------|---------|-------|
| `RedisGameRepository` | Redis implementation of IGameRepository | Game entity | Game entity from Redis | Infrastructure |
| `RedisService` | Redis connection and operations | Redis commands | Redis responses | Infrastructure |
| `ConnectionTracker` | WebSocket connection to game mapping | Connection ID, game code, player | Connection metadata | Infrastructure |

### Data Models and Contracts

**Game Entity:**
```typescript
interface Game {
  gameCode: string;                    // 6 alphanumeric characters
  board: Board;                        // 3x3 board value object
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | null;
  players: {
    X?: string;                        // Connection ID for player X
    O?: string;                        // Connection ID for player O
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**GameDTO (for Redis storage):**
```typescript
interface GameDTO {
  gameCode: string;
  board: BoardDTO;                     // BoardCell[][] (serialized)
  status: string;
  currentPlayer: string;
  winner: string | null;
  players: string;                     // JSON string of { X?: string, O?: string }
  createdAt: string;                   // ISO timestamp
  updatedAt: string;                   // ISO timestamp
}
```

**WebSocket Message Contracts (from shared types):**

Client → Server:
- `JoinGameMessage`: `{ type: 'join', gameCode: string }`
- `MakeMoveMessage`: `{ type: 'move', gameCode: string, row: number, col: number }` (Epic 3)

Server → Client:
- `JoinedMessage`: `{ type: 'joined', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: GameStatus, playerSymbol: PlayerSymbol }`
- `UpdateMessage`: `{ type: 'update', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: 'playing' }`
- `ErrorMessage`: `{ type: 'error', code: ErrorCode, message: string, details?: unknown }`

**Error Codes:**
- `INVALID_MESSAGE`: Malformed message structure
- `GAME_NOT_FOUND`: Game code doesn't exist
- `GAME_FULL`: Game already has two players
- `CONNECTION_ERROR`: WebSocket connection issues

### APIs and Interfaces

**IGameRepository Interface:**
```typescript
interface IGameRepository {
  create(game: Game, ttl: number): Promise<Game>;
  findByCode(gameCode: string): Promise<Game | null>;
  update(game: Game): Promise<Game>;
  exists(gameCode: string): Promise<boolean>;
}
```

**GameService Interface:**
```typescript
class GameService {
  createGame(connectionId: string): Promise<GameDTO>;
  joinGame(connectionId: string, gameCode: string): Promise<GameDTO>;
  getGame(gameCode: string): Promise<GameDTO | null>;
}
```

**GameGateway WebSocket Handlers:**
```typescript
@WebSocketGateway({ port: process.env.SERVER_PORT || 3001 })
class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket): void;
  handleDisconnect(client: Socket): void;
  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: JoinGameMessage): Promise<JoinedMessage | ErrorMessage>;
}
```

**Redis Storage Schema:**
- Key pattern: `game:{gameCode}`
- Storage format: Redis Hash with fields: `board`, `status`, `currentPlayer`, `winner`, `players`, `createdAt`, `updatedAt`
- TTL: 3600 seconds (1 hour)

### Workflows and Sequencing

**Game Creation Flow:**
1. Client connects via WebSocket → `GameGateway.handleConnection()`
2. Client sends `{ type: 'join', gameCode: 'NEW' }`
3. Gateway routes to `CreateGameUseCase.execute(connectionId)`
4. Use case generates unique game code via `GameCode.generate()`
5. Use case creates `Game` entity with initial state (empty board, status 'waiting')
6. Use case saves to Redis via `IGameRepository.create(game, ttl)`
7. Use case assigns player 'X' to connection
8. Gateway sends `JoinedMessage` to client with game code and initial state

**Game Joining Flow:**
1. Client connects via WebSocket → `GameGateway.handleConnection()`
2. Client sends `{ type: 'join', gameCode: 'ABC123' }`
3. Gateway routes to `JoinGameUseCase.execute(connectionId, gameCode)`
4. Use case validates game exists via `IGameRepository.findByCode(gameCode)`
5. Use case validates game status is 'waiting' (not 'playing' or 'finished')
6. Use case validates game has space (only one player currently)
7. Use case assigns player 'O' to connection
8. Use case updates game state: status → 'playing', players → { X: id1, O: id2 }
9. Use case saves updated state via `IGameRepository.update(game)`
10. Gateway sends `JoinedMessage` to joining client (O)
11. Gateway sends `UpdateMessage` to first client (X) notifying game started

**Connection Disconnection Flow:**
1. Client disconnects → `GameGateway.handleDisconnect(client)`
2. Gateway removes connection from `ConnectionTracker`
3. Gateway updates game state (if applicable) to mark player as disconnected
4. Gateway logs disconnection event
5. Game state remains in Redis (with TTL) for potential reconnection

## Non-Functional Requirements

### Performance

- **WebSocket Connection Latency**: < 100ms for connection establishment
- **Message Processing**: < 50ms for join/game creation operations
- **Redis Operations**: < 10ms for game state read/write operations
- **Concurrent Games**: Support minimum 100 concurrent game sessions per server instance
- **Message Throughput**: Handle 1000+ messages/second per server instance
- **Connection Capacity**: Support 200+ concurrent WebSocket connections per server instance

**Performance Targets (from PRD):**
- Real-time updates feel instant (< 100ms perceived latency)
- Game creation completes in < 200ms end-to-end
- Game joining completes in < 200ms end-to-end

### Security

- **Input Validation**: All WebSocket messages validated for structure and required fields before processing
- **Game Code Validation**: Game codes validated for existence and format (6 alphanumeric characters)
- **Connection Validation**: Prevent joining games that have already started (status = 'playing')
- **Error Message Sanitization**: Error messages do not expose internal system details
- **No Authentication Required**: MVP scope excludes authentication (acceptable for demo project)
- **Rate Limiting**: Consider rate limiting for game creation to prevent abuse (optional for MVP)

**Security Considerations:**
- Game codes are case-sensitive and randomly generated (6^62 possible combinations)
- Redis TTL prevents abandoned games from consuming resources indefinitely
- Connection tracking prevents unauthorized access to game sessions

### Reliability/Availability

- **Stateless Server Design**: All game state stored in Redis, enabling server restarts without data loss
- **Redis TTL**: Automatic cleanup of abandoned games (1 hour TTL)
- **Connection Resilience**: Graceful handling of client disconnections
- **Error Recovery**: Clear error messages enable clients to recover from invalid operations
- **Game State Consistency**: Single source of truth (Redis) ensures consistency across operations
- **Server Instance Independence**: Each server instance (A/B) operates independently with shared Redis state

**Availability Targets:**
- Server uptime: 99%+ (for demo purposes)
- Redis connection retry: Exponential backoff on connection failures
- Graceful degradation: Server continues operating for local operations if Redis unavailable (with error notifications)

### Observability

- **Connection Logging**: Log all WebSocket connection/disconnection events with connection IDs
- **Game Lifecycle Logging**: Log game creation, joining, and state transitions
- **Error Logging**: Log all error conditions with context (game code, connection ID, error code)
- **Performance Metrics**: Log operation timings for game creation and joining
- **Redis Operation Logging**: Log Redis read/write operations for debugging (optional, verbose mode)

**Required Log Signals:**
- Connection events: `[INFO] Client connected: {connectionId}`
- Disconnection events: `[INFO] Client disconnected: {connectionId}`
- Game creation: `[INFO] Game created: {gameCode}, player X: {connectionId}`
- Game joining: `[INFO] Game joined: {gameCode}, player O: {connectionId}`
- Errors: `[ERROR] {errorCode}: {message} - Game: {gameCode}, Connection: {connectionId}`

**Debug Information:**
- Connection ID tracking for all operations
- Game code in all log messages
- Operation timestamps
- Server instance ID (server-a or server-b)

## Dependencies and Integrations

**External Dependencies:**

| Dependency | Version | Purpose | Epic |
|------------|---------|---------|------|
| `@nestjs/core` | Latest | NestJS framework core | 1, 2 |
| `@nestjs/common` | Latest | NestJS common utilities | 1, 2 |
| `@nestjs/websockets` | Latest | WebSocket Gateway support | 2 |
| `@nestjs/platform-ws` | Latest | WebSocket platform adapter | 2 |
| `ioredis` | Latest | Redis client (TypeScript-friendly) | 1, 2, 4 |
| `@fusion-tic-tac-toe/shared` | Workspace | Shared message and game types | 1, 2 |
| `ws` | Latest | WebSocket library (used by NestJS) | 2 |

**Internal Dependencies:**

| Dependency | Source | Purpose |
|------------|--------|---------|
| `packages/shared/src/types/messages.ts` | Story 1.3 | WebSocket message type definitions |
| `packages/shared/src/types/game.ts` | Story 1.3 | Game state types (Board, BoardDTO, GameStatus) |
| `packages/shared/src/types/errors.ts` | Story 1.3 | Error code definitions |
| `packages/server/src/infrastructure/redis/` | Story 4.1 | Redis service and repository (Epic 4, but interface defined in Epic 2) |

**Integration Points:**

1. **WebSocket Client ↔ Server**: 
   - Protocol: WebSocket (ws://)
   - Ports: 3001 (Server A), 3002 (Server B)
   - Message format: JSON
   - Connection: HTTP upgrade to WebSocket

2. **Server ↔ Redis**:
   - Protocol: Redis protocol (via ioredis)
   - Port: 6379 (default)
   - Storage: Redis Hash at key `game:{gameCode}`
   - TTL: 3600 seconds (1 hour)

3. **Server ↔ Server** (Epic 4, prepared in Epic 2):
   - Protocol: Redis pub/sub (via ioredis)
   - Channel pattern: `game:sync:{gameCode}`
   - Purpose: Real-time state synchronization (deferred to Epic 4)

**Environment Variables:**
- `SERVER_PORT`: WebSocket server port (3001 or 3002)
- `SERVER_ID`: Server identifier ('server-a' or 'server-b')
- `REDIS_HOST`: Redis server hostname (default: 'localhost' or 'redis' in Docker)
- `REDIS_PORT`: Redis server port (default: 6379)

## Acceptance Criteria (Authoritative)

**Story 2.1: WebSocket Server Setup**
1. WebSocket Gateway exists at `packages/server/src/presentation/game/game.gateway.ts` with `@WebSocketGateway()` decorator
2. Gateway implements `OnGatewayConnection` and `OnGatewayDisconnect` interfaces
3. Gateway configured for port from environment variable (default 3001)
4. GameModule exists and provides GameGateway
5. Server starts successfully and accepts WebSocket connections
6. Docker runtime testing completed (Task 4 from Story 2.1)
7. Integration tests with client-server stubbing implemented (Task 5 from Story 2.1)

**Story 2.2: Game Code Generation**
8. Game code generation produces 6 alphanumeric characters
9. Generated codes are unique (not already in use)
10. Codes are case-sensitive
11. Uniqueness check implemented with retry logic (max 10 retries)

**Story 2.3: Game Creation**
12. Client sends `{ type: 'join', gameCode: 'NEW' }` triggers game creation
13. Server generates unique game code
14. Server creates game state with empty 3x3 board, status 'waiting', currentPlayer 'X'
15. Server stores game state in Redis at key `game:{gameCode}` with TTL 3600 seconds
16. Server assigns player 'X' to creating client
17. Server sends `JoinedMessage` with game code, board, status, and playerSymbol

**Story 2.4: Game Joining**
18. Client sends `{ type: 'join', gameCode: 'ABC123' }` for existing game
19. Server validates game code exists in Redis
20. Server validates game status is 'waiting' (not 'playing' or 'finished')
21. Server validates game has space (only one player currently)
22. Server assigns player 'O' to joining client
23. Server updates game state: status → 'playing', players → { X: id1, O: id2 }
24. Server sends `JoinedMessage` to joining client (O)
25. Server sends `UpdateMessage` to first client (X)
26. Third client attempting to join 'playing' game receives `GAME_FULL` error

**Story 2.5: Message Protocol**
27. Shared types package defines all message types (JoinGameMessage, JoinedMessage, UpdateMessage, ErrorMessage)
28. Type guards implemented: `isClientMessage()`, `isServerMessage()`
29. Message types match architecture specification exactly
30. Server Gateway validates incoming messages using type guards

**Story 2.6: Message Validation**
31. Server validates message is valid JSON
32. Server validates message has required `type` field
33. Server validates message type is recognized ('join' or 'move')
34. Server validates required fields present (gameCode for join, row/col for move)
35. Invalid messages receive `INVALID_MESSAGE` error
36. Non-existent game codes receive `GAME_NOT_FOUND` error

**Story 2.7: Connection Management**
37. Server detects disconnection in `handleDisconnect()` method
38. Server removes connection from game's player tracking
39. Server updates game state if needed (mark player as disconnected)
40. Server logs disconnection events
41. Connection tracking maps connections to game codes and player symbols

## Traceability Mapping

| AC ID | Functional Requirement | Spec Section | Component/API | Test Idea |
|-------|------------------------|--------------|---------------|-----------|
| AC 1-7 | FR18, FR19, FR25 | Story 2.1 | GameGateway, GameModule | Integration test: WebSocket connection acceptance |
| AC 8-11 | FR1 (game code) | Story 2.2 | GameCode value object, GameService | Unit test: Code generation uniqueness |
| AC 12-17 | FR1 (create game) | Story 2.3 | CreateGameUseCase, RedisGameRepository | Integration test: Game creation flow |
| AC 18-26 | FR2 (join game), FR3 (player assignment) | Story 2.4 | JoinGameUseCase, GameService | Integration test: Game joining with validation |
| AC 27-30 | FR26, FR27 | Story 2.5 | Shared types, type guards | Unit test: Type guard validation |
| AC 31-36 | FR28, FR29, FR31 | Story 2.6 | MessageValidationService | Unit test: Message validation logic |
| AC 37-41 | FR30 (connection handling) | Story 2.7 | GameGateway, ConnectionTracker | Integration test: Disconnection handling |

**FR Coverage Summary:**
- FR1: Create game session → AC 12-17 (Story 2.3)
- FR2: Join game (with restriction) → AC 18-26 (Story 2.4)
- FR3: Track player assignment → AC 18-26 (Story 2.4)
- FR5: Multiple concurrent games → AC 12-17 (Story 2.3)
- FR18: Connect to Server A → AC 1-7 (Story 2.1)
- FR19: Connect to Server B → AC 1-7 (Story 2.1)
- FR25: WebSocket communication → AC 1-7 (Story 2.1)
- FR26: JSON messages → AC 27-30 (Story 2.5)
- FR27: Message types → AC 27-30 (Story 2.5)
- FR28: Validate messages → AC 31-36 (Story 2.6)
- FR29: Error messages → AC 31-36 (Story 2.6)
- FR30: Connection error handling → AC 37-41 (Story 2.7)
- FR31: Invalid game code errors → AC 31-36 (Story 2.6)

## Risks, Assumptions, Open Questions

**Risks:**

1. **Risk: Redis Connection Failures**
   - **Impact**: High - Game state storage depends on Redis
   - **Mitigation**: Implement connection retry with exponential backoff, graceful error handling
   - **Status**: Addressed in Story 2.3 with error handling

2. **Risk: Game Code Collisions**
   - **Impact**: Medium - Duplicate codes could cause game conflicts
   - **Mitigation**: Uniqueness check with retry logic (max 10 retries), 6-character codes provide 62^6 combinations
   - **Status**: Addressed in Story 2.2

3. **Risk: WebSocket Connection Scalability**
   - **Impact**: Medium - High concurrent connections may impact performance
   - **Mitigation**: Stateless design enables horizontal scaling, connection pooling
   - **Status**: Architecture supports scaling, monitoring needed

4. **Risk: Docker Runtime Issues**
   - **Impact**: Low - Deployment validation blocked
   - **Mitigation**: Task 4 in Story 2.1 addresses Docker runtime testing
   - **Status**: Addressed in Story 2.1

**Assumptions:**

1. **Assumption**: Redis is available and accessible for all server instances
   - **Rationale**: Required for stateless server design and Epic 4 synchronization
   - **Validation**: Docker Compose ensures Redis availability

2. **Assumption**: WebSocket connections are stable for game duration
   - **Rationale**: MVP scope excludes reconnection handling
   - **Validation**: Connection management (Story 2.7) handles disconnections gracefully

3. **Assumption**: Game codes are shared securely between players
   - **Rationale**: No authentication in MVP, players must share codes manually
   - **Validation**: Acceptable for demo project

4. **Assumption**: 6-character game codes provide sufficient uniqueness
   - **Rationale**: 62^6 = 56.8 billion combinations, acceptable for MVP
   - **Validation**: Uniqueness check with retry ensures no collisions

**Open Questions:**

1. **Question**: Should game state be persisted beyond TTL for game history?
   - **Answer**: Out of scope for MVP, deferred to future features
   - **Status**: Resolved - TTL-based cleanup only

2. **Question**: Should players be able to rejoin disconnected games?
   - **Answer**: Optional for MVP, game state remains in Redis with TTL
   - **Status**: Resolved - Reconnection not required for MVP

3. **Question**: What happens if both players disconnect simultaneously?
   - **Answer**: Game state remains in Redis with TTL, can be cleaned up automatically
   - **Status**: Resolved - TTL handles cleanup

## Test Strategy Summary

**Test Levels:**

1. **Unit Tests (Domain & Application Layers)**
   - **Coverage Target**: 100% for domain, 90%+ for application
   - **Scope**: GameCode generation, Game entity, message validation logic
   - **Framework**: Jest with TypeScript support
   - **Approach**: Pure unit tests, no mocks for domain, mocked interfaces for application

2. **Integration Tests (Infrastructure & Presentation Layers)**
   - **Coverage Target**: 80%+ for infrastructure, 70%+ for presentation
   - **Scope**: Redis operations, WebSocket Gateway, end-to-end game creation/joining
   - **Framework**: Jest with NestJS testing utilities (`Test.createTestingModule()`)
   - **Approach**: Real Redis for integration tests (Docker), stubbed WebSocket clients

3. **End-to-End Tests (Full System)**
   - **Coverage Target**: Critical user flows
   - **Scope**: Game creation → joining → connection lifecycle
   - **Framework**: Jest with WebSocket test clients
   - **Approach**: Real server instances, real Redis, test WebSocket clients

**Test Coverage by Story:**

- **Story 2.1**: Integration tests for Gateway connection/disconnection, Docker runtime tests
- **Story 2.2**: Unit tests for GameCode generation and uniqueness validation
- **Story 2.3**: Integration tests for game creation flow, Redis storage validation
- **Story 2.4**: Integration tests for game joining with all validation scenarios
- **Story 2.5**: Unit tests for type guards, message type validation
- **Story 2.6**: Unit tests for message validation service, error code mapping
- **Story 2.7**: Integration tests for disconnection handling, connection tracking

**Test Data Strategy:**

- Use test game codes: `TEST01`, `TEST02` for integration tests
- Mock Redis client for unit tests, real Redis for integration tests
- Stub WebSocket connections for isolated Gateway tests
- Use test connection IDs: `test-connection-1`, `test-connection-2`

**Edge Cases to Test:**

1. Duplicate game code generation (retry logic)
2. Joining non-existent game (GAME_NOT_FOUND)
3. Joining full game (GAME_FULL)
4. Joining finished game (validation)
5. Invalid message structure (INVALID_MESSAGE)
6. Missing required fields in messages
7. Concurrent game creation requests
8. Client disconnection during game creation
9. Client disconnection during active game
10. Redis connection failures (error handling)

**Test Execution:**

- Unit tests: Fast execution, no external dependencies
- Integration tests: Require Redis (Docker), slower execution
- E2E tests: Require full stack (Docker Compose), slowest execution
- CI/CD: Run unit tests on every commit, integration tests on PR, E2E tests on merge

