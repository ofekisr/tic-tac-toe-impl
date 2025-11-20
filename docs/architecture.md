# Architecture

## Executive Summary

This architecture defines a stateless, real-time multiplayer Tic-Tac-Toe game system using TypeScript, WebSocket servers, Redis for state synchronization, and Docker Compose deployment. The system demonstrates distributed architecture principles with two independent server instances behind a load balancer, maintaining real-time game state consistency across servers through Redis pub/sub.

## Project Initialization

First implementation story should execute:
```bash
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-ws @nestjs/websockets
npm install ioredis
npm install -D typescript @types/node ts-node nodemon
npm install -D jest @types/jest @nestjs/testing ts-jest
```

This establishes the base architecture with these decisions:
- TypeScript as the primary language
- NestJS for server framework (with built-in WebSocket support)
- ioredis for Redis integration
- Jest for testing framework

## Decision Summary

| Category | Decision | Version | Affects FR Categories | Rationale |
| -------- | -------- | ------- | --------------------- | --------- |
| Language | TypeScript | Latest stable | All | Type safety, better developer experience, aligns with Clean Code principles |
| Runtime | Node.js | LTS (20.x) | All | Stable, well-supported runtime for WebSocket servers |
| WebSocket Support | @nestjs/websockets | Latest | Real-Time Synchronization, Communication Protocol | Built into NestJS, Gateway pattern, type-safe |
| State Management | Redis | Latest stable | Game Management, Real-Time Synchronization | Enables stateless servers, pub/sub for server-to-server sync |
| Redis Client | ioredis | Latest | All | TypeScript-friendly, robust connection handling |
| Testing Framework | Jest | Latest | All | Industry standard, excellent TypeScript support, TDD workflow |
| Server Framework | NestJS | Latest | All | TypeScript-first, built-in WebSocket support, dependency injection, perfect for SOLID/DRY principles |
| Deployment | Docker Compose | Latest | All | Simple orchestration, matches requirement for 2 instances + load balancer |
| Load Balancer | Nginx | Latest stable | All | Standard, reliable, simple configuration |
| Architecture Pattern | Layered Architecture | - | All | Enables SOLID/DRY principles, separation of concerns |
| Code Quality | Clean Code + TDD | - | All | Developer requirement: write tests first, maintain clean codebase |

## Project Structure

**Monorepo Structure (Parallel Development Enabled):**

```
fusion-tic-tac-toe/
├── packages/
│   ├── shared/                    # Shared contracts and types
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── messages.ts    # WebSocket message types
│   │   │   │   ├── game.ts        # Game state types
│   │   │   │   └── errors.ts      # Error types
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   └── contract.test.ts   # Protocol contract tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                     # Server implementation (NestJS)
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Game.ts
│   │   │   │   │   ├── Player.ts
│   │   │   │   │   └── Move.ts
│   │   │   │   ├── interfaces/
│   │   │   │   │   ├── IGameRepository.ts
│   │   │   │   │   ├── IGameStateService.ts
│   │   │   │   │   └── IRedisClient.ts
│   │   │   │   └── value-objects/
│   │   │   │       ├── GameCode.ts
│   │   │   │       └── BoardPosition.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   │   ├── GameService.ts
│   │   │   │   │   ├── MoveValidationService.ts
│   │   │   │   │   └── GameStateService.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── CreateGameUseCase.ts
│   │   │   │       ├── JoinGameUseCase.ts
│   │   │   │       ├── MakeMoveUseCase.ts
│   │   │   │       └── SyncGameStateUseCase.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── redis/
│   │   │   │   │   ├── redis.module.ts
│   │   │   │   │   ├── redis.service.ts
│   │   │   │   │   └── redis-game.repository.ts
│   │   │   │   └── config/
│   │   │   │       └── config.module.ts
│   │   │   ├── presentation/
│   │   │   │   ├── game/
│   │   │   │   │   ├── game.module.ts
│   │   │   │   │   ├── game.gateway.ts        # WebSocket Gateway
│   │   │   │   │   └── game.controller.ts     # HTTP endpoints (health)
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   └── infrastructure/
│   │   │   ├── integration/
│   │   │   │   ├── game-flow.test.ts
│   │   │   │   └── redis-sync.test.ts
│   │   │   └── mocks/
│   │   │       └── MockClient.ts  # Mock client for server testing
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   │
│   ├── client/                    # CLI client implementation
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── GameBoard.ts
│   │   │   │   └── interfaces/
│   │   │   │       └── IWebSocketClient.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   │   ├── GameClientService.ts
│   │   │   │   │   └── InputParserService.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── ConnectToGameUseCase.ts
│   │   │   │       └── SubmitMoveUseCase.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── websocket/
│   │   │   │   │   └── WebSocketClient.ts
│   │   │   │   └── mocks/
│   │   │   │       └── MockServer.ts
│   │   │   └── presentation/
│   │   │       └── cli/
│   │   │           ├── GameCLI.ts
│   │   │           ├── BoardRenderer.ts
│   │   │           └── InputHandler.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   │
│   └── mock-server/               # Standalone mock server
│       ├── src/
│       │   └── MockWebSocketServer.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   └── nginx.conf
├── docker-compose.yml
├── package.json                  # Root workspace config
├── tsconfig.json                 # Root TypeScript config
└── README.md
```

**Workspace Configuration:**

Root `package.json` should use npm workspaces:
```json
{
  "name": "fusion-tic-tac-toe",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "dev:server": "npm run dev --workspace=packages/server",
    "dev:client": "npm run dev --workspace=packages/client",
    "dev:mock-server": "npm run dev --workspace=packages/mock-server"
  }
}
```

## FR Category to Architecture Mapping

| FR Category | Lives In | Components |
| ---------- | -------- | ---------- |
| Game Management | `application/services/GameService.ts`<br>`infrastructure/redis/RedisGameRepository.ts` | GameService, RedisGameRepository, CreateGameUseCase, JoinGameUseCase |
| Gameplay | `application/services/MoveValidationService.ts`<br>`application/use-cases/MakeMoveUseCase.ts` | MoveValidationService, MakeMoveUseCase, Game entity |
| Real-Time Synchronization | `infrastructure/redis/RedisClient.ts`<br>`application/use-cases/SyncGameStateUseCase.ts` | Redis pub/sub, SyncGameStateUseCase, WebSocketHandler |
| Client Interface | `presentation/handlers/WebSocketMessageHandler.ts`<br>`infrastructure/websocket/WebSocketServer.ts` | WebSocketServer, WebSocketMessageHandler |
| Communication Protocol | `presentation/handlers/WebSocketMessageHandler.ts`<br>`domain/interfaces/IWebSocketHandler.ts` | Message handlers, WebSocket protocol implementation |
| Error Handling | `application/services/` (all services)<br>`presentation/handlers/WebSocketMessageHandler.ts` | Error handling in all layers, standardized error responses |

## Technology Stack Details

### Core Technologies

**TypeScript (Latest Stable)**
- Strict mode enabled
- Target: ES2022
- Module: CommonJS or ESM (based on Node.js version)

**Node.js (LTS 20.x)**
- Runtime environment
- Native WebSocket support via `ws` package

**NestJS (Latest)**
- TypeScript-first server framework
- Built-in WebSocket support via `@nestjs/websockets` (Gateway pattern)
- Dependency injection (perfect for SOLID/DIP principles)
- Modular architecture (ideal for layered design)
- Decorator-based (clean, readable code)
- Built-in validation and error handling
- Excellent Jest integration for testing
- Uses `ws` library under the hood (no performance penalty)

**Why NestJS for This Project:**
1. **SOLID/DIP Alignment**: Dependency injection makes interfaces and abstractions natural
2. **Layered Architecture**: Modules map perfectly to domain/application/infrastructure layers
3. **Interface-Based Design**: DI container makes swapping implementations trivial
4. **TDD Support**: Built-in testing utilities with Jest, easy mocking
5. **Clean Code**: Decorators reduce boilerplate, improve readability
6. **Type Safety**: Full TypeScript support throughout
7. **WebSocket Gateway**: Clean abstraction over WebSocket handling

**NestJS Patterns Used:**
- **Modules**: Organize code by feature (GameModule, RedisModule)
- **Gateways**: Handle WebSocket connections (`@WebSocketGateway`)
- **Services**: Business logic (`@Injectable()`)
- **Providers**: Dependency injection for interfaces
- **Controllers**: HTTP endpoints (`@Controller()`)
- **Pipes**: Validation and transformation (`@UsePipes()`)
- **Exception Filters**: Error handling (`@Catch()`)

**Jest Testing with NestJS:**
- `@nestjs/testing` provides testing utilities
- `Test.createTestingModule()` for integration tests
- Easy mocking with `jest.mock()` or NestJS providers
- `overrideProvider()` for swapping implementations in tests
- Perfect for TDD workflow

**ioredis (Latest)**
- Redis client with TypeScript support
- Connection pooling
- Pub/sub support for server synchronization

**Jest (Latest)**
- Testing framework
- TypeScript support via ts-jest
- Coverage reporting enabled

### Integration Points

**Client ↔ Server:**
- WebSocket connection on ports 3001 (Server A) or 3002 (Server B)
- JSON message protocol
- Connection established via HTTP upgrade

**Server ↔ Server:**
- Redis pub/sub channel: `game:sync:{gameCode}`
- State synchronization messages broadcast via Redis
- Each server subscribes to all game sync channels

**Server ↔ Redis:**
- Game state storage: `game:{gameCode}`
- Pub/sub channels: `game:sync:{gameCode}`
- TTL on game state keys (e.g., 1 hour)

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Conventions

**Files:**
- PascalCase for classes/interfaces: `GameService.ts`, `IGameRepository.ts`
- camelCase for instances: `gameService`, `redisClient`
- kebab-case for test files: `game-service.test.ts`

**Classes/Interfaces:**
- Interfaces prefix with `I`: `IGameRepository`, `IRedisClient`
- Services suffix with `Service`: `GameService`, `MoveValidationService`
- Use cases suffix with `UseCase`: `CreateGameUseCase`, `MakeMoveUseCase`
- Repositories suffix with `Repository`: `RedisGameRepository`

**Variables/Functions:**
- camelCase: `gameCode`, `makeMove()`, `validateMove()`
- Boolean prefixes: `isValid`, `hasWinner`, `canMakeMove`

**Constants:**
- UPPER_SNAKE_CASE: `MAX_BOARD_SIZE`, `GAME_STATE_TTL`

### Code Organization

**Layer Responsibilities:**
- **Domain**: Pure business logic, no dependencies on infrastructure
- **Application**: Orchestrates domain logic, defines use cases
- **Infrastructure**: External system integrations (Redis, WebSocket)
- **Presentation**: Handles incoming requests, formats responses

**Dependency Direction:**
- Presentation → Application → Domain
- Infrastructure → Domain (implements domain interfaces)
- Application depends on domain interfaces, not implementations

## Dependency Graph & Development Order

### Layer Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SYSTEMS                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  Redis   │  │ WebSocket│  │   HTTP   │                │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
└───────┼──────────────┼──────────────┼───────────────────────┘
        │              │              │
        │              │              │
┌───────▼──────────────▼──────────────▼───────────────────────┐
│              INFRASTRUCTURE LAYER                            │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ RedisService     │  │ WebSocketGateway │                │
│  │ RedisRepository  │  │                  │                │
│  └────────┬──────────┘  └────────┬──────────┘                │
│           │                      │                           │
│           │ implements          │ uses                      │
└───────────┼──────────────────────┼───────────────────────────┘
            │                      │
            │                      │
┌───────────▼──────────────────────▼───────────────────────────┐
│                    DOMAIN LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Game     │  │    Move      │  │    Board     │      │
│  │   Entity    │  │   Entity     │  │   Value      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │IGameRepository│ │IGameStateService│ │IRedisClient │      │
│  │   Interface   │  │   Interface   │  │  Interface  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────┬─────────────────────────────────────────────────┘
            │
            │ depends on interfaces
            │
┌───────────▼───────────────────────────────────────────────────┐
│              APPLICATION LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  GameService    │  │ MoveValidation   │                  │
│  │  GameStateService│ │    Service       │                  │
│  └────────┬─────────┘  └────────┬─────────┘                  │
│           │                      │                             │
│           │                      │                             │
│  ┌────────▼──────────────────────▼─────────┐                 │
│  │         Use Cases                       │                 │
│  │  CreateGameUseCase                      │                 │
│  │  JoinGameUseCase                        │                 │
│  │  MakeMoveUseCase                       │                 │
│  │  SyncGameStateUseCase                  │                 │
│  └─────────────────────────────────────────┘                 │
└───────────┬───────────────────────────────────────────────────┘
            │
            │ uses
            │
┌───────────▼───────────────────────────────────────────────────┐
│              PRESENTATION LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ GameGateway     │  │ GameController   │                   │
│  │ (WebSocket)     │  │ (HTTP/Health)    │                   │
│  └──────────────────┘  └──────────────────┘                   │
└────────────────────────────────────────────────────────────────┘
```

### Component Dependency Details

#### Domain Layer (No Dependencies)

**Components:**
- `Game` entity
- `Move` entity
- `Board` value object
- `GameCode` value object
- `BoardPosition` value object
- `IGameRepository` interface
- `IGameStateService` interface
- `IRedisClient` interface

**Dependencies:** NONE (pure TypeScript types and classes)

**Development Order:** Can be developed first, independently

---

#### Application Layer (Depends on Domain)

**Components:**
- `GameService` → depends on: `IGameRepository`, `IGameStateService`
- `MoveValidationService` → depends on: `Board`, `Move`
- `GameStateService` → depends on: `IGameRepository`, `Board`, `Move`
- `CreateGameUseCase` → depends on: `GameService`, `IGameRepository`
- `JoinGameUseCase` → depends on: `GameService`, `IGameRepository`
- `MakeMoveUseCase` → depends on: `GameService`, `MoveValidationService`, `Move`
- `SyncGameStateUseCase` → depends on: `GameStateService`, `IRedisClient`

**Dependencies:**
- Domain interfaces (`IGameRepository`, `IGameStateService`, `IRedisClient`)
- Domain entities (`Game`, `Move`, `Board`)

**Development Order:** After Domain layer is complete

---

#### Infrastructure Layer (Implements Domain Interfaces)

**Components:**
- `RedisService` → implements: `IRedisClient`
- `RedisGameRepository` → implements: `IGameRepository`
- `RedisModule` → provides: `RedisService`, `RedisGameRepository`
- `ConfigModule` → provides: Environment configuration

**Dependencies:**
- Domain interfaces (implements them)
- External: `ioredis` library
- External: Redis server

**Development Order:** Can be developed in parallel with Application layer (both depend on Domain)

---

#### Presentation Layer (Depends on Application)

**Components:**
- `GameGateway` → depends on: `GameService`, `MakeMoveUseCase`, `JoinGameUseCase`
- `GameController` → depends on: Health check utilities
- `GameModule` → wires: Gateway, Controller, Services

**Dependencies:**
- Application services (`GameService`, use cases)
- Infrastructure (via dependency injection)
- External: NestJS WebSocket Gateway
- External: WebSocket connections

**Development Order:** After Application and Infrastructure layers

---

### Dependency Rules (Prevent Bugs)

#### ✅ Allowed Dependencies

1. **Presentation → Application → Domain**
   ```
   GameGateway → GameService → IGameRepository
   ```

2. **Infrastructure → Domain (implements interfaces)**
   ```
   RedisGameRepository → implements IGameRepository
   ```

3. **Application → Domain (uses interfaces, not implementations)**
   ```
   GameService → IGameRepository (interface, not RedisGameRepository)
   ```

4. **Within same layer (coordination only)**
   ```
   MakeMoveUseCase → GameService (both in Application layer)
   ```

#### ❌ Forbidden Dependencies (Will Cause Bugs)

1. **Domain → Any other layer**
   ```
   ❌ Game → RedisService (Domain must have NO dependencies)
   ❌ Move → GameService (Domain must be pure)
   ```

2. **Application → Infrastructure (direct)**
   ```
   ❌ GameService → RedisGameRepository (use interface instead)
   ✅ GameService → IGameRepository (correct)
   ```

3. **Domain → Domain (circular)**
   ```
   ❌ Game → Move → Game (circular dependency)
   ```

4. **Presentation → Domain (bypass Application)**
   ```
   ❌ GameGateway → Game entity directly (use Application layer)
   ✅ GameGateway → GameService → Game (correct)
   ```

5. **Infrastructure → Application**
   ```
   ❌ RedisService → GameService (wrong direction)
   ```

---

### Development Order (Prevent Dependency Issues)

#### Phase 1: Foundation (No Dependencies)

**1. Domain Layer - Value Objects**
```
1. BoardPosition
2. GameCode
3. Board (value object)
4. Move (value object)
```
**Why First:** No dependencies, pure TypeScript

**2. Domain Layer - Entities**
```
5. Game entity
6. Player entity
7. Move entity (if separate from value object)
```
**Why Second:** Depends only on value objects

**3. Domain Layer - Interfaces**
```
8. IGameRepository
9. IGameStateService
10. IRedisClient
```
**Why Third:** Define contracts before implementations

---

#### Phase 2: Core Logic (Depends on Domain)

**4. Application Layer - Services**
```
11. MoveValidationService (depends on Board, Move)
12. GameStateService (depends on IGameRepository, Board, Move)
13. GameService (depends on IGameRepository, IGameStateService)
```
**Why Fourth:** Business logic depends on domain

**5. Application Layer - Use Cases**
```
14. CreateGameUseCase (depends on GameService)
15. JoinGameUseCase (depends on GameService)
16. MakeMoveUseCase (depends on GameService, MoveValidationService)
17. SyncGameStateUseCase (depends on GameStateService, IRedisClient)
```
**Why Fifth:** Orchestrates services

---

#### Phase 3: Infrastructure (Implements Domain)

**6. Infrastructure Layer - Redis**
```
18. RedisService (implements IRedisClient)
19. RedisGameRepository (implements IGameRepository)
20. RedisModule (wires Redis components)
```
**Why Sixth:** Can develop in parallel with Application (both depend on Domain)

---

#### Phase 4: Presentation (Depends on Application)

**7. Presentation Layer**
```
21. GameGateway (depends on use cases)
22. GameController (health checks)
23. GameModule (wires everything)
24. main.ts (bootstrap)
```
**Why Last:** Depends on all other layers

---

### Dependency Injection Flow (NestJS)

```
main.ts
  └─> AppModule
       └─> GameModule
            ├─> GameGateway (Presentation)
            │    └─> MakeMoveUseCase (Application)
            │         ├─> GameService (Application)
            │         │    ├─> IGameRepository (Domain interface)
            │         │    └─> IGameStateService (Domain interface)
            │         └─> MoveValidationService (Application)
            │              └─> Board, Move (Domain)
            │
            └─> RedisModule (Infrastructure)
                 └─> RedisGameRepository (Infrastructure)
                      └─> implements IGameRepository (Domain)
```

**Dependency Injection Rules:**
- **Provide interfaces** in Domain layer
- **Implement interfaces** in Infrastructure layer
- **Inject interfaces** in Application layer (not implementations)
- **Wire implementations** in NestJS modules

---

### Testing Order (Follows Dependency Order)

**1. Domain Tests (No Mocks Needed)**
```typescript
// Test Board, Move, Game entities
// Pure unit tests, no dependencies
```

**2. Application Tests (Mock Domain Interfaces)**
```typescript
// Mock IGameRepository, IGameStateService
// Test GameService, Use Cases
```

**3. Infrastructure Tests (Mock External Systems)**
```typescript
// Mock Redis client
// Test RedisGameRepository
```

**4. Integration Tests (Real Dependencies)**
```typescript
// Test full flow: Gateway → Use Case → Service → Repository → Redis
```

---

### Common Dependency Violations to Avoid

#### ❌ Violation 1: Domain Importing Infrastructure
```typescript
// ❌ WRONG
import { RedisService } from '../infrastructure/redis/redis.service';

class Game {
  // Domain should never know about infrastructure
}
```

#### ❌ Violation 2: Application Importing Concrete Implementation
```typescript
// ❌ WRONG
import { RedisGameRepository } from '../infrastructure/redis/redis-game.repository';

class GameService {
  constructor(private repo: RedisGameRepository) {} // Wrong!
}
```

```typescript
// ✅ CORRECT
import { IGameRepository } from '../domain/interfaces/IGameRepository';

class GameService {
  constructor(private repo: IGameRepository) {} // Correct!
}
```

#### ❌ Violation 3: Presentation Bypassing Application
```typescript
// ❌ WRONG
import { Game } from '../domain/entities/Game';

@WebSocketGateway()
export class GameGateway {
  handleMove(game: Game) { // Bypassing Application layer
    // Direct domain manipulation
  }
}
```

```typescript
// ✅ CORRECT
import { MakeMoveUseCase } from '../application/use-cases/MakeMoveUseCase';

@WebSocketGateway()
export class GameGateway {
  constructor(private makeMoveUseCase: MakeMoveUseCase) {}
  
  handleMove(move: Move) {
    this.makeMoveUseCase.execute(move); // Use Application layer
  }
}
```

#### ❌ Violation 4: Circular Dependencies
```typescript
// ❌ WRONG
// Game.ts
import { Move } from './Move';
class Game {
  makeMove(move: Move) {}
}

// Move.ts
import { Game } from './Game';
class Move {
  applyTo(game: Game) {} // Circular dependency!
}
```

```typescript
// ✅ CORRECT
// Game.ts
import { Move } from './Move';
class Game {
  makeMove(move: Move) {}
}

// Move.ts (no import of Game)
class Move {
  // Move doesn't need to know about Game
}
```

---

### Dependency Checklist (Before Adding New Code)

**Before creating a new component, check:**

- [ ] Does it follow layer dependency rules?
- [ ] Are dependencies injected via interfaces (not concrete classes)?
- [ ] Does Domain layer have zero dependencies?
- [ ] Does Application layer only depend on Domain interfaces?
- [ ] Does Infrastructure implement Domain interfaces?
- [ ] Does Presentation depend on Application (not Domain directly)?
- [ ] Are there any circular dependencies?
- [ ] Can the component be tested independently with mocks?

---

### Development Workflow

**Step 1: Define Domain Interfaces**
```typescript
// domain/interfaces/IGameRepository.ts
export interface IGameRepository {
  create(game: Game): Promise<Game>;
  findByCode(code: string): Promise<Game | null>;
}
```

**Step 2: Implement Domain Entities**
```typescript
// domain/entities/Game.ts
export class Game {
  // Uses Board, Move (domain value objects)
  // No external dependencies
}
```

**Step 3: Create Application Services**
```typescript
// application/services/GameService.ts
export class GameService {
  constructor(
    private gameRepo: IGameRepository, // Interface, not implementation
    private gameStateService: IGameStateService
  ) {}
}
```

**Step 4: Implement Infrastructure**
```typescript
// infrastructure/redis/RedisGameRepository.ts
export class RedisGameRepository implements IGameRepository {
  // Implements domain interface
  // Uses RedisService (infrastructure)
}
```

**Step 5: Wire in Presentation**
```typescript
// presentation/game/game.gateway.ts
export class GameGateway {
  constructor(
    private createGameUseCase: CreateGameUseCase, // Application layer
    private makeMoveUseCase: MakeMoveUseCase
  ) {}
}
```

---

### Visual Dependency Matrix

| Component | Domain | Application | Infrastructure | Presentation | External |
|-----------|--------|------------|----------------|--------------|----------|
| **Domain** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Application** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Infrastructure** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Presentation** | ❌ | ✅ | ✅* | ✅ | ✅ |

*Infrastructure accessed via dependency injection, not direct import

---

### Key Principles

1. **Domain Independence**: Domain layer has ZERO dependencies
2. **Interface-Based**: Application depends on interfaces, not implementations
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **Single Direction**: Dependencies flow in one direction only
5. **Testability**: Each layer can be tested independently with mocks

**Test Organization:**
- Mirror source structure: `tests/unit/domain/`, `tests/unit/application/`
- Integration tests: `tests/integration/`
- Co-locate test files: `GameService.test.ts` next to `GameService.ts` (or in tests/ mirror)

### Error Handling

**Error Types:**
- Domain errors: `InvalidMoveError`, `GameNotFoundError`
- Infrastructure errors: `RedisConnectionError`, `WebSocketError`
- Application errors: `GameCreationFailedError`

**Error Response Format:**
```typescript
{
  type: 'error',
  code: 'INVALID_MOVE',
  message: 'Cell already occupied',
  details?: any
}
```

**Error Propagation:**
- Domain errors bubble up through application layer
- Infrastructure errors wrapped in application errors
- Presentation layer formats errors for client

### Logging Strategy

**Log Levels:**
- `error`: Errors requiring attention
- `warn`: Warnings, recoverable issues
- `info`: Important events (game created, move made)
- `debug`: Detailed debugging information

**Log Format:**
- Structured logging: JSON format
- Include: timestamp, level, message, context (gameCode, playerId, etc.)

**What to Log:**
- Game lifecycle events (create, join, end)
- Move attempts (success/failure)
- Server synchronization events
- Connection/disconnection events
- Errors with full context

### Data Formats

**WebSocket Messages:**
```typescript
// Client → Server
{
  type: 'join' | 'move',
  gameCode?: string,
  row?: number,
  col?: number
}

// Server → Client
{
  type: 'joined' | 'update' | 'win' | 'draw' | 'error',
  gameCode?: string,
  board?: string[][],
  currentPlayer?: 'X' | 'O',
  winner?: 'X' | 'O' | null,
  message?: string,
  code?: string
}
```

**Redis Game State (using BoardDTO):**
```json
{
  "gameCode": "ABC123",
  "board": [["", "", ""], ["", "", ""], ["", "", ""]],  // BoardDTO (BoardCell[][])
  "currentPlayer": "X",
  "status": "playing" | "finished",
  "winner": "X" | "O" | null,
  "players": {
    "X": "server-a",
    "O": "server-b"
  }
}
```

**Note:** Redis stores `BoardDTO` (serialized as JSON). When loading from Redis:
1. Parse JSON to get `BoardDTO` (BoardCell[][])
2. Convert to domain object: `BoardMapper.fromDTO(boardDTO)` → `Board`
3. Use `Board` object in domain logic

### Communication Patterns

**WebSocket Connection Lifecycle:**
1. Client connects via WebSocket
2. Server assigns connection ID
3. Client sends `join` message with gameCode
4. Server validates, subscribes to Redis channel
5. Server sends `joined` confirmation
6. Game state updates broadcast to all clients in game

**Server-to-Server Sync:**
1. Server A receives move from client (as row/col in WebSocket message)
2. Server A converts to Move object (encapsulates row, col, player, timestamp)
3. Server A validates Move object
4. Server A updates Redis game state with Move
5. Server A publishes sync message to Redis channel
6. Server B receives sync message
7. Server B reconstructs Move object from sync data
8. Server B updates local state (if needed)
9. Server B broadcasts update to connected clients

**State Management:**
- Game state stored in Redis with TTL
- Each server caches game state in memory for active games
- Cache invalidation on Redis pub/sub updates
- Stateless design: no server-local state persistence

## Consistency Rules

### Naming Conventions

**Files:**
- PascalCase for TypeScript files: `GameService.ts`
- Test files: `game-service.test.ts` (kebab-case)

**Classes:**
- PascalCase: `GameService`, `RedisGameRepository`
- Interface prefix `I`: `IGameRepository`, `IRedisClient`

**Functions/Methods:**
- camelCase: `createGame()`, `validateMove()`, `isValidPosition()`
- Verb-noun pattern: `makeMove()`, `getGameState()`, `updateBoard()`

**Variables:**
- camelCase: `gameCode`, `currentPlayer`, `boardState`
- Boolean: `isValid`, `hasWinner`, `canMakeMove`

**Constants:**
- UPPER_SNAKE_CASE: `MAX_BOARD_SIZE = 3`, `GAME_STATE_TTL = 3600`

### Code Organization

**Layer Structure:**
```
domain/          → Pure business logic, no external dependencies
application/     → Use cases, orchestrates domain logic
infrastructure/  → External integrations (Redis, WebSocket)
presentation/    → Request/response handling
```

**Dependency Rules:**
- Domain has NO dependencies
- Application depends on Domain interfaces
- Infrastructure implements Domain interfaces
- Presentation depends on Application services

**File Naming:**
- One class/interface per file
- File name matches class/interface name
- Tests co-located or in `tests/` mirror structure

### Error Handling

**Error Classes:**
```typescript
class InvalidMoveError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'InvalidMoveError';
  }
}
```

**Error Response:**
- Always include `type: 'error'`
- Include `code` for client handling
- Include `message` for user display
- Optional `details` for debugging

**Error Handling Pattern:**
```typescript
try {
  // operation
} catch (error) {
  if (error instanceof DomainError) {
    // Handle domain error
  } else {
    // Handle unexpected error
  }
}
```

### Logging Approach

**Structured Logging:**
```typescript
logger.info('Game created', { gameCode, serverId });
logger.error('Invalid move', { gameCode, move: move.toPosition(), error: error.message });
```

**Log Levels:**
- `error`: System errors, failed operations
- `warn`: Recoverable issues, validation failures
- `info`: Important events (game lifecycle)
- `debug`: Detailed flow information

## Data Architecture

### Board Type

**Board Class (Value Object):**
```typescript
class Board {
  private readonly cells: BoardCell[][];

  constructor(cells?: BoardCell[][]) {
    if (cells) {
      this.validateBoard(cells);
      this.cells = cells;
    } else {
      // Create empty 3x3 board
      this.cells = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    }
  }

  getCell(row: number, col: number): BoardCell {
    this.validatePosition(row, col);
    return this.cells[row][col];
  }

  setCell(row: number, col: number, value: BoardCell): void {
    this.validatePosition(row, col);
    this.cells[row][col] = value;
  }

  isEmpty(row: number, col: number): boolean {
    return this.getCell(row, col) === '';
  }

  toArray(): BoardCell[][] {
    // Return deep copy to prevent external mutation
    return this.cells.map(row => [...row]);
  }

  isFull(): boolean {
    return this.cells.every(row => row.every(cell => cell !== ''));
  }

  static fromArray(cells: BoardCell[][]): Board {
    return new Board(cells);
  }

  private validateBoard(cells: BoardCell[][]): void {
    if (cells.length !== 3) {
      throw new Error('Board must be 3x3');
    }
    for (const row of cells) {
      if (row.length !== 3) {
        throw new Error('Board must be 3x3');
      }
    }
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Position must be between 0 and 2');
    }
  }
}
```

**Benefits of Board Type:**
- **Encapsulation**: Hides internal `BoardCell[][]` structure
- **Type Safety**: Prevents using raw arrays incorrectly
- **Validation**: Ensures 3x3 size on construction
- **Immutability**: `toArray()` returns copies, prevents external mutation
- **Semantic Methods**: `isEmpty()`, `isFull()`, `getCell()`, `setCell()`
- **Serialization**: Easy conversion to/from JSON arrays for WebSocket messages

**Usage Examples:**
```typescript
// Create empty board
const board = new Board();

// Create from array
const board = Board.fromArray([
  ["X", "O", ""],
  ["", "X", "O"],
  ["O", "", "X"]
]);

// Access cells
const cell = board.getCell(1, 1);  // Returns 'X'
board.setCell(0, 0, 'X');
const isEmpty = board.isEmpty(1, 1);  // false
const isFull = board.isFull();  // false

// Serialize for JSON (WebSocket messages)
const array = board.toArray();  // Returns BoardCell[][]
```

### BoardDTO (Data Transfer Object)

**Purpose:** DTO for serialization and data transfer (WebSocket messages, Redis storage)

**BoardDTO Type:**
```typescript
// DTO for data transfer (WebSocket, Redis)
export type BoardDTO = BoardCell[][];

// Conversion methods
export class BoardMapper {
  static toDTO(board: Board): BoardDTO {
    return board.toArray();
  }

  static fromDTO(dto: BoardDTO): Board {
    return Board.fromArray(dto);
  }
}
```

**Usage:**
- **WebSocket Messages**: Use `BoardDTO` (serialized as `BoardCell[][]`)
- **Redis Storage**: Use `BoardDTO` (JSON serialization)
- **Domain Logic**: Use `Board` (domain object with methods)
- **Conversion**: `BoardMapper.toDTO()` and `BoardMapper.fromDTO()`

**Why Use DTOs:**
- **Separation of Concerns**: Domain objects (`Board`) separate from transfer format (`BoardDTO`)
- **Serialization**: DTOs are plain data structures, easy to serialize/deserialize
- **API Contract**: DTOs define the external interface (WebSocket messages)
- **Storage**: DTOs used for Redis persistence (simple JSON)
- **Flexibility**: Can change domain object without changing API contract

**Flow Example:**
```typescript
// Domain layer: Work with Board object
const board = new Board();
board.setCell(1, 1, 'X');

// Presentation layer: Convert to DTO for WebSocket
const boardDTO = BoardMapper.toDTO(board);
const message = {
  type: 'update',
  gameCode: 'ABC123',
  board: boardDTO  // BoardCell[][]
};

// Redis storage: Store as DTO
await redis.hset(`game:${gameCode}`, 'board', JSON.stringify(boardDTO));

// Redis retrieval: Convert DTO back to Board
const storedDTO = JSON.parse(await redis.hget(`game:${gameCode}`, 'board'));
const board = BoardMapper.fromDTO(storedDTO);
```

### Game State Model

**Game Entity:**
```typescript
interface Game {
  gameCode: string;
  board: Board; // Board type (not BoardCell[][])
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished';
  winner: 'X' | 'O' | null;
  players: {
    X?: string; // server identifier
    O?: string; // server identifier
  };
  moves: Move[]; // History of moves
  createdAt: Date;
  updatedAt: Date;
}
```

**Move Entity (Value Object):**
```typescript
class Move {
  constructor(
    public readonly row: number,      // 0-2
    public readonly col: number,      // 0-2
    public readonly player: PlayerSymbol, // 'X' or 'O'
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.row < 0 || this.row > 2 || this.col < 0 || this.col > 2) {
      throw new Error('Move position must be between 0 and 2');
    }
  }

  toPosition(): BoardPosition {
    return { row: this.row, col: this.col };
  }

  equals(other: Move): boolean {
    return this.row === other.row && this.col === other.col;
  }
}
```

**Player Assignment:**
- First player to join becomes 'X'
- Second player becomes 'O'
- Tracked by server identifier

### Redis Data Structure

**Game State Key:**
- Pattern: `game:{gameCode}`
- Type: Hash
- TTL: 3600 seconds (1 hour)

**Pub/Sub Channels:**
- Pattern: `game:sync:{gameCode}`
- Message: JSON serialized game state update

**Connection Tracking:**
- Pattern: `game:connections:{gameCode}`
- Type: Set
- Value: WebSocket connection IDs

## API Contracts

### WebSocket Message Protocol

**Client → Server Messages:**

```typescript
// Join game
{
  type: 'join',
  gameCode: string
}

// Make move
{
  type: 'move',
  gameCode: string,
  row: number,  // 0-2
  col: number   // 0-2
}
```

**Server → Client Messages:**

```typescript
// Game joined successfully
{
  type: 'joined',
  gameCode: string,
  board: string[][],
  currentPlayer: 'X' | 'O',
  status: 'waiting' | 'playing'
}

// Board update
{
  type: 'update',
  gameCode: string,
  board: string[][],
  currentPlayer: 'X' | 'O',
  status: 'playing'
}

// Game won
{
  type: 'win',
  gameCode: string,
  board: string[][],
  winner: 'X' | 'O'
}

// Game drawn
{
  type: 'draw',
  gameCode: string,
  board: string[][]
}

// Error
{
  type: 'error',
  code: string,
  message: string,
  details?: any
}
```

### Message Validation

**Required Fields:**
- `type`: Always required
- `gameCode`: Required for `join` and `move`
- `row`, `col`: Required for `move`

**Validation Rules:**
- `row`, `col`: Must be 0, 1, or 2
- `gameCode`: Must exist in Redis
- `move`: Must be current player's turn
- `move`: Cell must be empty

## Server Deployment

**Note:** Servers run via Docker Compose, not as standalone CLI applications.

**Start all services:**
```bash
docker-compose up
```

**Start specific services:**
```bash
docker-compose up redis app1 app2 nginx
```

**View logs:**
```bash
docker-compose logs -f app1
docker-compose logs -f app2
```

**Stop services:**
```bash
docker-compose down
```

**Server Configuration (via Docker Compose):**
- Server instances configured in `docker-compose.yml`
- Environment variables set in compose file
- No manual server startup required

## Client CLI Interface

**Location:** `packages/client/`

**Quick Start:**
```bash
# Start the client
cd packages/client
npm start

# Or with custom server URL
SERVER_URL=ws://localhost:3001 npm start
```

**Simple Usage:**
The client provides an easy-to-use interface for creating and joining games.

**Simple Client Flow:**

```
Welcome to Tic-Tac-Toe!

[1] Create new game
[2] Join existing game
> 1

✓ Connected to server
🎮 Game created! Your code: ABC123
Share this code with your opponent.

Waiting for opponent...

✓ Opponent joined! You are X

    0   1   2
0  [ ] [ ] [ ]
1  [ ] [ ] [ ]
2  [ ] [ ] [ ]

Your turn (X): 1 1

    0   1   2
0  [ ] [ ] [ ]
1  [ ] [X] [ ]
2  [ ] [ ] [ ]

Waiting for opponent...

⚡ Opponent moved!

    0   1   2
0  [O] [ ] [ ]
1  [ ] [X] [ ]
2  [ ] [ ] [ ]

Your turn (X): 0 0
...
```

**Quick Commands:**
- Start client: `npm start` or `npm run dev`
- Create game: Select option 1
- Join game: Select option 2, enter game code
- Make move: Enter `row col` (e.g., `1 1` or `1,1`)
- Exit: `Ctrl+C` or `Ctrl+D`

## Server API Interface (Exposed to Client)

This section documents the complete interface that the server exposes to clients via WebSocket.

### Connection

**Protocol:** WebSocket (ws:// or wss://)

**Connection URLs:**
```
ws://localhost:3001  (Server A - direct connection)
ws://localhost:3002  (Server B - direct connection)
ws://localhost        (Via load balancer - Nginx)
```

**Connection Process:**
1. Client initiates WebSocket connection
2. Server accepts connection
3. Server assigns connection ID internally
4. Client can now send messages

**Connection Lifecycle:**
- Server sends ping frames every 30 seconds
- Client should respond with pong frames
- Connection timeout: 60 seconds of inactivity
- Client should reconnect and rejoin game if disconnected

### Message Protocol

**Format:** All messages are JSON objects

**Encoding:** UTF-8

**Message Types:**
- Client → Server: `join`, `move`
- Server → Client: `joined`, `update`, `win`, `draw`, `error`

---

### Client → Server Messages

#### 1. Join Game

**Purpose:** Create a new game or join an existing game

**Message:**
```typescript
{
  type: 'join',
  gameCode: string  // 'NEW' to create, or existing game code to join
}
```

**Examples:**

Create new game:
```json
{
  "type": "join",
  "gameCode": "NEW"
}
```

Join existing game:
```json
{
  "type": "join",
  "gameCode": "ABC123"
}
```

**Server Response:**
- Success: `joined` message
- Error: `error` message with code `GAME_NOT_FOUND` or `GAME_FULL`

---

#### 2. Make Move

**Purpose:** Place a piece on the board

**Message:**
```typescript
{
  type: 'move',
  gameCode: string,
  row: number,     // 0-2 (row index)
  col: number      // 0-2 (column index)
}
```

**Example:**
```json
{
  "type": "move",
  "gameCode": "ABC123",
  "row": 1,
  "col": 1
}
```

**Validation:**
- `gameCode` must exist
- `row` and `col` must be 0, 1, or 2
- Must be current player's turn
- Cell must be empty
- Game must be in 'playing' status

**Server Processing:**
1. Server receives WebSocket message with `row` and `col`
2. Server creates `Move` object: `new Move(row, col, currentPlayer)`
3. Server calls `makeMove(gameCode, move)` with Move object
4. Move object encapsulates position, player, and timestamp
5. Business logic operates on Move object (easier to test and extend)

**Server Response:**
- Success: `update`, `win`, or `draw` message
- Error: `error` message with appropriate code

**Note:** 
- WebSocket protocol uses `row`/`col` for simplicity, but internally the server uses `Move` objects
- WebSocket messages use `BoardDTO` (BoardCell[][]) for serialization
- Server converts: `Board` → `BoardDTO` using `BoardMapper.toDTO()` before sending
- Server converts: `BoardDTO` → `Board` using `BoardMapper.fromDTO()` after receiving

This allows:
- Easy presentation changes (e.g., convert "a1" notation to Move internally)
- Move history tracking (Move objects stored in Game.moves array)
- Better encapsulation and testability
- Clean separation between domain objects and transfer objects

**Presentation Flexibility:**

The `Move` object encapsulation enables easy presentation changes without modifying business logic:

```typescript
// Example: Client can accept different input formats

// Format 1: Row/Col (current CLI)
const move1 = new Move(1, 1, 'X');

// Format 2: Algebraic notation (future enhancement)
class Move {
  static fromAlgebraic(notation: string, player: PlayerSymbol): Move {
    // "a1" → row:0, col:0
    // "b2" → row:1, col:1
    // "c3" → row:2, col:2
    const col = notation.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = parseInt(notation[1]) - 1;
    return new Move(row, col, player);
  }
}

// Format 3: Index-based (future enhancement)
class Move {
  static fromIndex(index: number, player: PlayerSymbol): Move {
    // 0-8 → row/col conversion
    const row = Math.floor(index / 3);
    const col = index % 3;
    return new Move(row, col, player);
  }
}

// All formats create same Move object
// makeMove(gameCode, move) works with any format
// Business logic unchanged regardless of input format
```

**Benefits:**
- Presentation layer converts user input → Move object
- Business logic only deals with Move objects (single responsibility)
- Easy to add new input formats without changing core logic
- Move history naturally stored as `Game.moves: Move[]`
- Testing simplified (test with Move objects directly)

---

### Server → Client Messages

#### 1. Joined Message

**Purpose:** Confirmation that client successfully joined a game

**Message:**
```typescript
{
  type: 'joined',
  gameCode: string,
  board: BoardCell[][],        // Serialized Board (Board.toArray())
  currentPlayer: 'X' | 'O',    // Whose turn it is now
  status: 'waiting' | 'playing',
  playerSymbol: 'X' | 'O'      // Which symbol this client is playing as
}
```

**Note:** WebSocket messages use `BoardDTO` (which is `BoardCell[][]`) for JSON serialization. Server converts `Board` → `BoardDTO` using `BoardMapper.toDTO()` before sending. Client converts `BoardDTO` → `Board` using `BoardMapper.fromDTO()` after receiving.

**Example:**
```json
{
  "type": "joined",
  "gameCode": "ABC123",
  "board": [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ],
  "currentPlayer": "X",
  "status": "waiting",
  "playerSymbol": "X"
}
```

**When Sent:**
- After successful `join` message
- Sent only to the client that joined
- If second player joins, first player receives `update` message

---

#### 2. Update Message

**Purpose:** Board state has changed (move made, player joined)

**Message:**
```typescript
{
  type: 'update',
  gameCode: string,
  board: BoardCell[][],  // Serialized Board (Board.toArray())
  currentPlayer: 'X' | 'O',
  status: 'playing'
}
```

**Example:**
```json
{
  "type": "update",
  "gameCode": "ABC123",
  "board": [
    ["", "", ""],
    ["", "X", ""],
    ["", "", ""]
  ],
  "currentPlayer": "O",
  "status": "playing"
}
```

**When Sent:**
- After a valid move is made
- When second player joins (to first player)
- Broadcast to all clients in the game
- Sent to all servers via Redis pub/sub, then to their clients

---

#### 3. Win Message

**Purpose:** Game has been won

**Message:**
```typescript
{
  type: 'win',
  gameCode: string,
  board: BoardCell[][],  // Serialized Board (Board.toArray())
  winner: 'X' | 'O'
}
```

**Example:**
```json
{
  "type": "win",
  "gameCode": "ABC123",
  "board": [
    ["X", "O", ""],
    ["X", "X", "O"],
    ["X", "", "O"]
  ],
  "winner": "X"
}
```

**When Sent:**
- After a move that creates three in a row
- Broadcast to all clients in the game
- Game status becomes 'finished'

---

#### 4. Draw Message

**Purpose:** Game ended in a tie

**Message:**
```typescript
{
  type: 'draw',
  gameCode: string,
  board: BoardCell[][]  // Serialized Board (Board.toArray())
}
```

**Example:**
```json
{
  "type": "draw",
  "gameCode": "ABC123",
  "board": [
    ["X", "O", "X"],
    ["O", "X", "O"],
    ["O", "X", "O"]
  ]
}
```

**When Sent:**
- When board is full and no winner
- Broadcast to all clients in the game
- Game status becomes 'finished'

---

#### 5. Error Message

**Purpose:** Indicate an error occurred

**Message:**
```typescript
{
  type: 'error',
  code: ErrorCode,
  message: string,
  details?: unknown
}
```

**Error Codes:**
```typescript
enum ErrorCode {
  INVALID_MESSAGE = 'INVALID_MESSAGE',           // Malformed JSON or missing fields
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',            // Game code doesn't exist
  GAME_FULL = 'GAME_FULL',                      // Game already has 2 players
  INVALID_MOVE = 'INVALID_MOVE',                // Generic move validation error
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',              // Wrong player's turn
  CELL_OCCUPIED = 'CELL_OCCUPIED',              // Cell already has a piece
  INVALID_POSITION = 'INVALID_POSITION',        // Row/col out of bounds (not 0-2)
  GAME_ALREADY_FINISHED = 'GAME_ALREADY_FINISHED', // Game is over
  CONNECTION_ERROR = 'CONNECTION_ERROR',        // Connection issues
  SERVER_ERROR = 'SERVER_ERROR'                 // Internal server error
}
```

**Error Examples:**

Cell occupied:
```json
{
  "type": "error",
  "code": "CELL_OCCUPIED",
  "message": "Cell already occupied",
  "details": {
    "row": 1,
    "col": 1
  }
}
```

Not your turn:
```json
{
  "type": "error",
  "code": "NOT_YOUR_TURN",
  "message": "It's not your turn",
  "details": {
    "currentPlayer": "O",
    "yourSymbol": "X"
  }
}
```

Game not found:
```json
{
  "type": "error",
  "code": "GAME_NOT_FOUND",
  "message": "Game code 'XYZ789' does not exist"
}
```

Invalid position:
```json
{
  "type": "error",
  "code": "INVALID_POSITION",
  "message": "Position out of bounds. Row and column must be 0, 1, or 2",
  "details": {
    "row": 5,
    "col": 2
  }
}
```

---

### Complete Message Flow Example

**Scenario:** Two players play a complete game

```
1. Client 1 connects to ws://localhost:3001
   ✓ WebSocket connection established

2. Client 1 → Server: { "type": "join", "gameCode": "NEW" }
   Server → Client 1: { "type": "joined", "gameCode": "ABC123", "board": [[...]], "status": "waiting", "playerSymbol": "X" }

3. Client 2 connects to ws://localhost:3002
   ✓ WebSocket connection established

4. Client 2 → Server: { "type": "join", "gameCode": "ABC123" }
   Server → Client 2: { "type": "joined", "gameCode": "ABC123", "board": [[...]], "status": "playing", "playerSymbol": "O" }
   Server → Client 1: { "type": "update", "gameCode": "ABC123", "board": [[...]], "currentPlayer": "X", "status": "playing" }

5. Client 1 → Server: { "type": "move", "gameCode": "ABC123", "row": 1, "col": 1 }
   Server → Client 1: { "type": "update", "gameCode": "ABC123", "board": [[...]], "currentPlayer": "O", "status": "playing" }
   Server → Client 2: { "type": "update", "gameCode": "ABC123", "board": [[...]], "currentPlayer": "O", "status": "playing" }

6. Client 2 → Server: { "type": "move", "gameCode": "ABC123", "row": 0, "col": 0 }
   Server → Client 1: { "type": "update", "gameCode": "ABC123", "board": [[...]], "currentPlayer": "X", "status": "playing" }
   Server → Client 2: { "type": "update", "gameCode": "ABC123", "board": [[...]], "currentPlayer": "X", "status": "playing" }

7. [Game continues...]

8. Client 1 → Server: { "type": "move", "gameCode": "ABC123", "row": 2, "col": 0 }
   Server → Client 1: { "type": "win", "gameCode": "ABC123", "board": [[...]], "winner": "X" }
   Server → Client 2: { "type": "win", "gameCode": "ABC123", "board": [[...]], "winner": "X" }
```

---

### Error Handling

**Invalid Messages:**
- Malformed JSON → `INVALID_MESSAGE` error
- Missing required fields → `INVALID_MESSAGE` error
- Unknown message type → `INVALID_MESSAGE` error

**Game State Errors:**
- Game doesn't exist → `GAME_NOT_FOUND`
- Game full → `GAME_FULL`
- Game finished → `GAME_ALREADY_FINISHED`

**Move Validation Errors:**
- Not your turn → `NOT_YOUR_TURN`
- Cell occupied → `CELL_OCCUPIED`
- Invalid position → `INVALID_POSITION`

**Connection Errors:**
- Connection lost → Client should reconnect
- Server error → `SERVER_ERROR` with details

---

### Rate Limiting

**Limits:**
- Maximum 10 messages per second per connection
- Exceeding limit: Server sends error and may disconnect

**Implementation:**
- Server tracks message rate per connection
- Rate limit resets every second
- Violations logged for monitoring

---

### Board State Format

**Board Type Usage:**

**Internal (Server/Client):**
```typescript
// Create empty board
const board = new Board();

// Create from array
const board = Board.fromArray([
  ["X", "O", ""],
  ["", "X", "O"],
  ["O", "", "X"]
]);

// Access cells
const cell = board.getCell(1, 1);  // Returns 'X'
board.setCell(0, 0, 'X');
const isEmpty = board.isEmpty(1, 1);  // false
const isFull = board.isFull();  // false

// Serialize for JSON (WebSocket messages)
const array = board.toArray();  // Returns BoardCell[][]
```

**WebSocket Messages (JSON):**
- Messages use `BoardCell[][]` for serialization
- Server converts: `board.toArray()` before sending
- Client converts: `Board.fromArray()` after receiving

**Example JSON:**
```json
{
  "board": [
    ["X", "O", ""],
    ["", "X", "O"],
    ["O", "", "X"]
  ]
}
```

**Visual Representation:**
```
    0   1   2
0  [X] [O] [ ]
1  [ ] [X] [O]
2  [O] [ ] [X]
```

---

### Game Code Format

**Format:** Alphanumeric string, 6 characters
**Example:** `ABC123`, `XYZ789`
**Generation:** Server generates unique codes
**Validation:** Case-sensitive, must match exactly

---

### Multi-Server Synchronization

**How it works:**
1. Client connects to Server A or Server B (or via load balancer)
2. Move made on Server A → Updates Redis → Publishes to channel
3. Server B receives notification → Reads updated state → Broadcasts to its clients
4. All clients see updates regardless of which server they're connected to

**Redis Channels:**
- Pattern: `game:sync:{gameCode}`
- Message: JSON serialized game state update
- All servers subscribe to relevant channels

**State Storage:**
- Redis key: `game:{gameCode}`
- Format: Hash with game state fields
- TTL: 3600 seconds (1 hour)

## Security Architecture

### Connection Security

**WebSocket Security:**
- Validate origin (if needed for production)
- Rate limiting on connection attempts
- Connection timeout handling

**Input Validation:**
- Validate all message types
- Sanitize game codes
- Validate board coordinates (0-2 range)
- Prevent injection attacks

### State Security

**Game State Protection:**
- Validate moves server-side (never trust client)
- Prevent concurrent move conflicts
- Ensure turn order enforcement
- Validate game code ownership

**Redis Security:**
- Use Redis AUTH (password) in production
- Namespace keys: `game:{gameCode}`
- TTL on all game state keys
- Prevent key collision attacks

## Performance Considerations

### Real-Time Latency

**Target: < 100ms for state updates**

**Optimizations:**
- In-memory caching of active games
- Redis pub/sub for immediate propagation
- Minimal message payload size
- Efficient board state serialization

### Scalability

**Concurrent Games:**
- Redis handles state storage (scales horizontally)
- Stateless servers enable horizontal scaling
- Load balancer distributes connections
- Each server handles subset of games

**Connection Management:**
- Efficient WebSocket connection handling
- Connection pooling in Redis client
- Graceful connection cleanup

## Deployment Architecture

### Docker Compose Setup

**Services:**
1. **app1**: Server instance on port 3001
2. **app2**: Server instance on port 3002
3. **redis**: Redis server on port 6379
4. **nginx**: Load balancer on port 80

**Configuration:**
- Environment variables for Redis connection
- Health check endpoints
- Graceful shutdown handling

### Load Balancing Strategy

**Nginx Configuration:**
- Round-robin distribution
- Health check integration
- WebSocket upgrade support
- Sticky sessions (if needed for WebSocket)

**Server Instances:**
- Identical configuration
- Shared Redis instance
- Independent WebSocket servers
- Stateless design enables easy scaling

## Parallel Development Architecture

### Overview

This architecture enables **parallel development** of client and server by providing:
1. **Shared TypeScript types/interfaces** - Single source of truth for contracts
2. **Mock server** - Client developers can work without real server
3. **Mock client** - Server developers can test without real client
4. **Contract-first development** - Both teams implement against interfaces

### Project Structure for Parallel Development

```
fusion-tic-tac-toe/
├── packages/
│   ├── shared/                    # Shared contracts and types
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── messages.ts    # WebSocket message types
│   │   │   │   ├── game.ts        # Game state types
│   │   │   │   └── errors.ts      # Error types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/                    # Server implementation
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   ├── tests/
│   │   │   ├── mocks/
│   │   │   │   └── MockClient.ts  # Mock client for server testing
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── client/                    # CLI client implementation
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   │   ├── websocket/
│   │   │   │   │   └── WebSocketClient.ts
│   │   │   │   └── mocks/
│   │   │   │       └── MockServer.ts  # Mock server for client testing
│   │   │   └── presentation/
│   │   │       └── cli/
│   │   │           └── GameCLI.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── mock-server/               # Standalone mock server
│       ├── src/
│       │   └── MockWebSocketServer.ts
│       └── package.json
│
├── package.json                   # Root workspace config
└── tsconfig.json                  # Root TypeScript config
```

### Shared Types Package

**Location:** `packages/shared/src/types/`

**Purpose:** Single source of truth for all message types, game state, and error codes that both client and server must implement.

**File: `packages/shared/src/types/messages.ts`**
```typescript
// Client → Server Messages
export interface JoinGameMessage {
  type: 'join';
  gameCode: string;
}

export interface MakeMoveMessage {
  type: 'move';
  gameCode: string;
  row: number;  // 0-2
  col: number;  // 0-2
}

export type ClientMessage = JoinGameMessage | MakeMoveMessage;

// Server → Client Messages
export interface JoinedMessage {
  type: 'joined';
  gameCode: string;
  board: BoardDTO;  // BoardDTO (BoardCell[][]) for JSON serialization
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing';
  playerSymbol: 'X' | 'O';  // Which symbol this client is
}

export interface UpdateMessage {
  type: 'update';
  gameCode: string;
  board: BoardDTO;  // BoardDTO (BoardCell[][]) for JSON serialization
  currentPlayer: 'X' | 'O';
  status: 'playing';
}

export interface WinMessage {
  type: 'win';
  gameCode: string;
  board: BoardDTO;  // BoardDTO (BoardCell[][]) for JSON serialization
  winner: 'X' | 'O';
}

export interface DrawMessage {
  type: 'draw';
  gameCode: string;
  board: BoardDTO;  // BoardDTO (BoardCell[][]) for JSON serialization
}

export interface ErrorMessage {
  type: 'error';
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export type ServerMessage = JoinedMessage | UpdateMessage | WinMessage | DrawMessage | ErrorMessage;

// Type guards
export function isClientMessage(msg: unknown): msg is ClientMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}

export function isServerMessage(msg: unknown): msg is ServerMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}
```

**File: `packages/shared/src/types/game.ts`**
```typescript
export type BoardCell = '' | 'X' | 'O';
export type PlayerSymbol = 'X' | 'O';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export class Board {
  private readonly cells: BoardCell[][];

  constructor(cells?: BoardCell[][]) {
    if (cells) {
      this.validateBoard(cells);
      this.cells = cells;
    } else {
      // Create empty 3x3 board
      this.cells = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    }
  }

  private validateBoard(cells: BoardCell[][]): void {
    if (cells.length !== 3) {
      throw new Error('Board must be 3x3');
    }
    for (const row of cells) {
      if (row.length !== 3) {
        throw new Error('Board must be 3x3');
      }
    }
  }

  getCell(row: number, col: number): BoardCell {
    this.validatePosition(row, col);
    return this.cells[row][col];
  }

  setCell(row: number, col: number, value: BoardCell): void {
    this.validatePosition(row, col);
    this.cells[row][col] = value;
  }

  isEmpty(row: number, col: number): boolean {
    return this.getCell(row, col) === '';
  }

  toArray(): BoardCell[][] {
    // Return deep copy to prevent external mutation
    return this.cells.map(row => [...row]);
  }

  isFull(): boolean {
    return this.cells.every(row => row.every(cell => cell !== ''));
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Position must be between 0 and 2');
    }
  }

  static fromArray(cells: BoardCell[][]): Board {
    return new Board(cells);
  }
}

// DTO for data transfer (WebSocket, Redis)
export type BoardDTO = BoardCell[][];

// Mapper for conversion between Board (domain) and BoardDTO (transfer)
export class BoardMapper {
  static toDTO(board: Board): BoardDTO {
    return board.toArray();
  }

  static fromDTO(dto: BoardDTO): Board {
    return Board.fromArray(dto);
  }
}

export interface BoardPosition {
  row: number;  // 0-2
  col: number;  // 0-2
}

export interface GameState {
  gameCode: string;
  board: Board;  // Domain object (not BoardDTO)
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  players: {
    X?: string;  // server identifier or connection ID
    O?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class Move {
  constructor(
    public readonly row: number,
    public readonly col: number,
    public readonly player: PlayerSymbol,
    public readonly timestamp: Date = new Date()
  ) {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Move position must be between 0 and 2');
    }
  }

  toPosition(): BoardPosition {
    return { row: this.row, col: this.col };
  }

  equals(other: Move): boolean {
    return this.row === other.row && this.col === other.col;
  }
}

export const BOARD_SIZE = 3;
export const EMPTY_CELL: BoardCell = '';
```

**File: `packages/shared/src/types/errors.ts`**
```typescript
export enum ErrorCode {
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  INVALID_MOVE = 'INVALID_MOVE',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  CELL_OCCUPIED = 'CELL_OCCUPIED',
  INVALID_POSITION = 'INVALID_POSITION',
  GAME_ALREADY_FINISHED = 'GAME_ALREADY_FINISHED',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

export interface GameError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
```

### Mock Server for Client Development

**Location:** `packages/mock-server/`

**Purpose:** Standalone WebSocket server that implements the protocol contract. Client developers can use this to develop and test without waiting for server implementation.

**Features:**
- Implements exact message protocol from shared types
- Simulates game creation, joining, moves, win/draw detection
- No Redis dependency (in-memory state)
- Single server instance (no multi-server sync needed for client dev)
- Configurable port (default: 3001)

**Usage:**
```bash
# Start mock server
cd packages/mock-server
npm run dev

# Client connects to ws://localhost:3001
```

**Implementation Contract:**
- Must implement all message types from `packages/shared`
- Must validate moves according to game rules
- Must detect win/draw conditions
- Must send appropriate error messages

### Mock Client for Server Development

**Location:** `packages/server/tests/mocks/MockClient.ts`

**Purpose:** Test utility that simulates client behavior. Server developers can use this to test server logic without building the full CLI client.

**Features:**
- Connects via WebSocket
- Sends messages according to protocol
- Validates server responses
- Can simulate multiple clients (for testing two-player scenarios)

**Usage in Tests:**
```typescript
import { MockClient } from './mocks/MockClient';

test('server handles join game', async () => {
  const client = new MockClient('ws://localhost:3001');
  await client.connect();
  
  const response = await client.joinGame('ABC123');
  expect(response.type).toBe('joined');
  expect(response.gameCode).toBe('ABC123');
  
  await client.disconnect();
});
```

### CLI Client Architecture

**Location:** `packages/client/`

**Structure:**
```
packages/client/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── GameBoard.ts        # Board display logic
│   │   └── interfaces/
│   │       └── IWebSocketClient.ts
│   ├── application/
│   │   ├── services/
│   │   │   ├── GameClientService.ts
│   │   │   └── InputParserService.ts
│   │   └── use-cases/
│   │       ├── ConnectToGameUseCase.ts
│   │       └── SubmitMoveUseCase.ts
│   ├── infrastructure/
│   │   ├── websocket/
│   │   │   └── WebSocketClient.ts  # Implements IWebSocketClient
│   │   └── mocks/
│   │       └── MockServer.ts       # For client unit tests
│   └── presentation/
│       └── cli/
│           ├── GameCLI.ts         # Main CLI interface
│           ├── BoardRenderer.ts    # ASCII board display
│           └── InputHandler.ts    # User input handling
```

**CLI Client Responsibilities:**
- Connect to WebSocket server
- Display game board in ASCII format
- Accept user input (row, col coordinates)
- Handle real-time updates from server
- Display game status and results
- Handle errors gracefully

**CLI Interface:**
```
> npm run client

Welcome to Tic-Tac-Toe!

[1] Create new game
[2] Join existing game
> 1

Game created! Your game code is: ABC123
Share this code with your opponent.

Waiting for opponent to join...

[Board displays when opponent joins]

Your turn (X):
Enter move (row col): 1 1

[Board updates]
Waiting for opponent's move...

[Board updates when opponent moves]
Your turn (X):
Enter move (row col): 0 0

[Game ends]
Game Over! You won!
```

### Development Workflow

#### For Client Developers (Working Without Server)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start mock server:**
   ```bash
   cd packages/mock-server
   npm run dev
   ```

3. **Develop client against mock server:**
   ```bash
   cd packages/client
   npm run dev
   ```

4. **Run client tests (using mock server):**
   ```bash
   cd packages/client
   npm test
   ```

5. **Integration test with real server (when ready):**
   ```bash
   # Start real server
   cd packages/server
   npm run dev

   # Test client against real server
   cd packages/client
   npm run test:integration
   ```

#### For Server Developers (Working Without Client)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis:**
   ```bash
   docker-compose up redis
   ```

3. **Develop server:**
   ```bash
   cd packages/server
   npm run dev
   ```

4. **Run server tests (using MockClient):**
   ```bash
   cd packages/server
   npm test
   ```

5. **Manual testing with mock client:**
   ```bash
   # In one terminal - start server
   cd packages/server
   npm run dev

   # In another terminal - use mock client
   cd packages/server
   npm run test:manual
   ```

6. **Integration test with real client (when ready):**
   ```bash
   # Start server
   cd packages/server
   npm run dev

   # In another terminal - use real CLI client
   cd packages/client
   npm run dev
   ```

### Contract Testing

**Shared Contract Tests:**
- Location: `packages/shared/tests/contract.test.ts`
- Validates that both client and server implement protocol correctly
- Can be run by both teams to ensure compatibility

**Example Contract Test:**
```typescript
describe('WebSocket Protocol Contract', () => {
  it('client join message matches server expectation', () => {
    const message: JoinGameMessage = {
      type: 'join',
      gameCode: 'ABC123',
    };
    
    // Validate message structure
    expect(isClientMessage(message)).toBe(true);
    expect(message.type).toBe('join');
    expect(typeof message.gameCode).toBe('string');
  });

  it('server joined message matches client expectation', () => {
    const message: JoinedMessage = {
      type: 'joined',
      gameCode: 'ABC123',
      board: [[ '', '', '' ], [ '', '', '' ], [ '', '', '' ]],
      currentPlayer: 'X',
      status: 'waiting',
      playerSymbol: 'X',
    };
    
    expect(isServerMessage(message)).toBe(true);
    expect(message.type).toBe('joined');
    expect(message.board.length).toBe(3);
  });
});
```

### Interface Contracts

**IWebSocketClient Interface (Client Side):**
```typescript
// packages/client/src/domain/interfaces/IWebSocketClient.ts
export interface IWebSocketClient {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  send(message: ClientMessage): void;
  onMessage(handler: (message: ServerMessage) => void): void;
  onError(handler: (error: Error) => void): void;
  onClose(handler: () => void): void;
  isConnected(): boolean;
}
```

**IWebSocketHandler Interface (Server Side):**
```typescript
// packages/server/src/domain/interfaces/IWebSocketHandler.ts
export interface IWebSocketHandler {
  handleConnection(ws: WebSocket): void;
  handleMessage(ws: WebSocket, message: ClientMessage): void;
  handleDisconnection(ws: WebSocket): void;
  sendMessage(ws: WebSocket, message: ServerMessage): void;
  broadcastToGame(gameCode: string, message: ServerMessage): void;
}
```

### Development Environment

### Prerequisites

- Node.js LTS (20.x)
- Docker and Docker Compose (for Redis)
- npm or yarn
- Workspace support (npm workspaces or yarn workspaces)

### Setup Commands

**Initial Setup:**
```bash
# Install all dependencies (root and all packages)
npm install

# Build shared types package
cd packages/shared
npm run build

# Link shared package to other packages (if using workspaces, automatic)
```

**Server Development:**
```bash
cd packages/server

# Install dependencies
npm install

# Run tests
npm test

# Run in development mode
npm run dev

# Run with Redis (via Docker Compose)
docker-compose up redis
npm run dev
```

**Client Development:**
```bash
cd packages/client

# Install dependencies
npm install

# Run tests
npm test

# Run in development mode
npm run dev

# Start mock server first (in another terminal)
cd ../mock-server
npm run dev

# Then run client
cd ../client
npm run dev
```

**Mock Server:**
```bash
cd packages/mock-server

# Install dependencies
npm install

# Run mock server
npm run dev

# Runs on ws://localhost:3001 by default
```

**Full Stack (Integration):**
```bash
# Terminal 1: Start Redis
docker-compose up redis

# Terminal 2: Start Server A
cd packages/server
SERVER_PORT=3001 SERVER_ID=server-a npm run dev

# Terminal 3: Start Server B (optional, for multi-server testing)
cd packages/server
SERVER_PORT=3002 SERVER_ID=server-b npm run dev

# Terminal 4: Start Client
cd packages/client
npm run dev
```

### Environment Variables

**Server:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, for production
SERVER_PORT=3001  # Port for this server instance
SERVER_ID=server-a  # Unique identifier
NODE_ENV=development
```

**Client:**
```bash
SERVER_URL=ws://localhost:3001  # WebSocket server URL
CLI_MODE=interactive  # interactive | automated
```

**Mock Server:**
```bash
PORT=3001
LOG_LEVEL=debug
```

## Architecture Decision Records (ADRs)

### ADR-001: Stateless Server Design

**Decision:** Servers are completely stateless. All game state stored in Redis.

**Rationale:** Enables horizontal scaling, load balancing, and fault tolerance. Matches user requirement for stateless architecture.

**Consequences:**
- Redis becomes single point of state
- Network latency for state access
- Requires Redis high availability for production

### ADR-002: Redis for State Synchronization

**Decision:** Use Redis pub/sub for server-to-server synchronization.

**Rationale:** Simple, reliable, matches user requirement. Enables real-time state sync without complex federation protocols.

**Consequences:**
- Redis dependency for synchronization
- Pub/sub message ordering guaranteed
- Efficient for low-latency requirements

### ADR-003: NestJS Server Framework

**Decision:** Use NestJS instead of Express.js + ws.

**Rationale:** 
- TypeScript-first framework aligns with project requirements
- Built-in WebSocket support via `@nestjs/websockets` (Gateway pattern)
- Dependency injection enables SOLID/DIP principles naturally
- Modular architecture matches layered design requirements
- Decorator-based code is clean and readable
- Excellent Jest integration for TDD workflow
- Built-in validation and error handling
- Better suited for interface-based design

**Consequences:**
- More structure/boilerplate than Express.js
- Steeper learning curve if team unfamiliar
- Better long-term maintainability
- Easier to test with dependency injection
- Natural fit for SOLID/DRY principles

### ADR-004: Layered Architecture with SOLID/DRY

**Decision:** Strict layered architecture following SOLID and DRY principles.

**Rationale:** Matches user requirement. Enables testability, maintainability, and clean code practices.

**Consequences:**
- More files/structure
- Clear separation of concerns
- Easy to test each layer independently

### ADR-005: Interface-Based Design

**Decision:** All dependencies defined as interfaces in domain layer.

**Rationale:** Matches user requirement. Enables dependency inversion, testability, and loose coupling.

**Consequences:**
- More interface definitions
- Clear contracts between layers
- Easy to mock for testing

### ADR-006: Docker Compose with Nginx Load Balancer

**Decision:** Deploy with Docker Compose, 2 server instances, Nginx load balancer.

**Rationale:** Matches user requirement exactly. Simple, standard solution for development and production.

**Consequences:**
- Docker dependency
- Nginx configuration needed
- Standard load balancing approach

### ADR-007: TDD Approach

**Decision:** Write tests before implementation (TDD).

**Rationale:** Matches user requirement. Ensures code quality and test coverage.

**Consequences:**
- Slower initial development
- Higher code quality
- Better test coverage

### ADR-008: TypeScript with Strict Mode

**Decision:** Use TypeScript with strict type checking.

**Rationale:** Type safety, better developer experience, aligns with Clean Code principles.

**Consequences:**
- More verbose than JavaScript
- Compile-time type checking
- Better IDE support

### ADR-009: Parallel Development Architecture

**Decision:** Enable parallel client and server development through shared contracts, mock implementations, and monorepo structure.

**Rationale:** Allows client and server teams to work independently without blocking each other. Reduces integration risk and enables faster development cycles.

**Components:**
- Shared types package (`packages/shared`) - Single source of truth for protocol
- Mock server (`packages/mock-server`) - Client developers can test without real server
- Mock client (`packages/server/tests/mocks`) - Server developers can test without real client
- Monorepo structure - All packages in one repository with workspace support

**Consequences:**
- More initial setup complexity
- Requires discipline to keep shared contracts in sync
- Mock implementations must stay aligned with real implementations
- Enables independent development and testing
- Reduces integration surprises

**Development Workflow:**
1. Define contracts in `packages/shared` first
2. Client team implements against mock server
3. Server team implements against mock client
4. Integration testing when both are ready
5. Contract tests ensure compatibility

---

## Quick Reference: Parallel Development

### For Client Developers

**Start Development:**
```bash
# 1. Install all dependencies
npm install

# 2. Build shared types
cd packages/shared && npm run build && cd ../..

# 3. Start mock server (Terminal 1)
cd packages/mock-server
npm run dev

# 4. Develop client (Terminal 2)
cd packages/client
npm run dev
```

**Run Tests:**
```bash
cd packages/client
npm test              # Unit tests with mocks
npm run test:integration  # Integration tests (requires real server)
```

**Key Files:**
- Protocol types: `packages/shared/src/types/messages.ts`
- Client interface: `packages/client/src/domain/interfaces/IWebSocketClient.ts`
- Mock server: `packages/mock-server/src/MockWebSocketServer.ts`

### For Server Developers

**Start Development:**
```bash
# 1. Install all dependencies
npm install

# 2. Build shared types
cd packages/shared && npm run build && cd ../..

# 3. Start Redis (Terminal 1)
docker-compose up redis

# 4. Develop server (Terminal 2)
cd packages/server
npm run dev
```

**Run Tests:**
```bash
cd packages/server
npm test              # Unit tests with MockClient
npm run test:integration  # Integration tests (requires Redis)
```

**Key Files:**
- Protocol types: `packages/shared/src/types/messages.ts`
- Server interface: `packages/server/src/domain/interfaces/IWebSocketHandler.ts`
- Mock client: `packages/server/tests/mocks/MockClient.ts`

### Contract Changes

**When updating the protocol:**
1. Update types in `packages/shared/src/types/`
2. Run contract tests: `cd packages/shared && npm test`
3. Update mock server to match new protocol
4. Update mock client to match new protocol
5. Notify other team of changes
6. Both teams update implementations

**Contract Testing:**
```bash
cd packages/shared
npm test  # Validates protocol contract
```

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-01-27_
_For: ofeki_

