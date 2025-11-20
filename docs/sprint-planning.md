# Sprint Planning: fusion-tic-tac-toe

**Date:** 2025-11-20  
**Planning Team:** Bob (SM), Winston (Architect), Amelia (Dev), Murat (Test Architect), John (PM)

---

## Development Principles

**TDD Approach:**
- Write tests FIRST before implementation
- Red → Green → Refactor cycle
- Tests must pass before moving to next story
- Coverage: Domain (100%), Application (90%+), Infrastructure (80%+)
- **Test Structure:** Use AAA (Arrange-Act-Assert) principle:
  - **Arrange:** Set up test data, mocks, and preconditions
  - **Act:** Execute the code under test (single action)
  - **Assert:** Verify expected outcomes and side effects
  - Clear separation with comments improves readability
  - Test files can be longer than production code (up to 500 lines acceptable)

**SOLID Principles:**
- **Single Responsibility:** Each class has ONE reason to change
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Interfaces can be swapped without breaking code
- **Interface Segregation:** Small, focused interfaces
- **Dependency Inversion:** Depend on abstractions (interfaces), not concretions

**DRY (Don't Repeat Yourself):**
- Extract common logic into reusable functions/classes
- Shared types in `packages/shared`
- Common utilities in shared modules

**Code Size Guidelines:**
- **Modules:** < 300 lines
- **Classes:** < 150 lines
- **Methods:** < 15 lines
- **Files:** One class/interface per file
- **Test Files:** Can be longer than production code (up to 500 lines acceptable)
  - Use AAA (Arrange-Act-Assert) principle for test structure
  - Arrange: Set up test data and mocks
  - Act: Execute the code under test
  - Assert: Verify expected outcomes
  - Clear separation between sections improves readability

---

## Dependency-Based Sprint Organization

### Sprint 0: Foundation (Epic 1)
**Goal:** Establish project infrastructure - NO CODE LOGIC YET

**Stories (Sequential):**
1. **Story 1.1:** Project Structure and Package Initialization
2. **Story 1.2:** TypeScript Configuration
3. **Story 1.3:** Shared Types Package Setup
4. **Story 1.4:** Server Package Setup with NestJS
5. **Story 1.5:** Client Package Setup
6. **Story 1.6:** Docker Compose Configuration
7. **Story 1.7:** Testing Framework Configuration

**Parallel Opportunities:** None (foundation must be sequential)

**TDD Notes:** Setup stories don't require TDD (infrastructure only)

---

### Sprint 1: Domain Layer (Bottom of Dependency Graph)
**Goal:** Build pure domain logic with ZERO dependencies - enables all other work

**Stories (Can be parallel after Story 3.1):**

#### Story 3.1: Domain Layer - Board and Move Value Objects
**Dependencies:** Story 1.3 (shared types)
**TDD Approach:**
- Write tests for `Board` class first:
  - `Board.test.ts`: Test constructor, getCell, setCell, isEmpty, isFull, toArray, fromArray
  - Test validation (3x3 requirement, position bounds)
  - Use AAA pattern in each test:
    ```typescript
    it('should get cell value at position', () => {
      // Arrange
      const board = new Board();
      board.setCell(1, 1, 'X');
      
      // Act
      const cell = board.getCell(1, 1);
      
      // Assert
      expect(cell).toBe('X');
    });
    ```
- Write tests for `Move` class:
  - `Move.test.ts`: Test constructor, toPosition, equals, validation
  - Use AAA pattern consistently
- Implement classes to pass tests
- Refactor for clarity

**Code Structure:**
```
packages/shared/src/types/game.ts
  - Board class (< 150 lines)
  - Move class (< 100 lines)
  - BoardMapper class (< 50 lines)
```

**SOLID/DRY:**
- Board encapsulates board logic (SRP)
- Move encapsulates move data (SRP)
- BoardMapper handles DTO conversion (SRP)

---

### Sprint 2: Domain Interfaces & Application Layer Foundation
**Goal:** Define contracts and build business logic that depends only on domain

**Stories (Parallel Work Opportunities):**

#### Story 2.5: WebSocket Message Protocol Implementation (Shared Types)
**Dependencies:** Story 1.3
**Can be parallel with:** Story 3.1
**TDD Approach:**
- Write tests for type guards: `isClientMessage()`, `isServerMessage()`
- Write tests for message validation
- Implement types and type guards

**Code Structure:**
```
packages/shared/src/types/messages.ts (< 300 lines)
  - ClientMessage types
  - ServerMessage types
  - Type guard functions
```

#### Story 3.2: Move Validation Service (Application Layer)
**Dependencies:** Story 3.1 (Board, Move)
**Can be parallel with:** Story 2.5
**TDD Approach:**
- Write `MoveValidationService.test.ts` FIRST:
  - Test valid moves (correct turn, empty cell, valid position)
  - Test invalid moves (wrong turn, occupied cell, out of bounds, finished game)
  - Mock Game entity for tests
- Implement `MoveValidationService` to pass tests
- Keep service < 150 lines, methods < 15 lines each

**Code Structure:**
```
packages/server/src/application/services/MoveValidationService.ts
  - validateMove() method
  - validateTurn() private method
  - validateCell() private method
  - validatePosition() private method
```

**SOLID/DRY:**
- Single responsibility: Move validation only
- Depends on domain objects (Board, Move) - no infrastructure
- Small, focused methods (DRY)

---

### Sprint 3: Infrastructure Layer (Parallel with Application)
**Goal:** Implement Redis and WebSocket infrastructure - can develop in parallel with Application layer

**Stories (Parallel Work Opportunities):**

#### Story 4.1: Redis Integration Setup
**Dependencies:** Story 1.4 (server setup)
**Can be parallel with:** Stories 3.2, 4.2
**TDD Approach:**
- Write `RedisService.test.ts` with mocked ioredis:
  - Test connection, get, set, hget, hset, publish, subscribe
  - Test error handling
- Implement `RedisService` to pass tests
- Keep service < 150 lines

**Code Structure:**
```
packages/server/src/infrastructure/redis/redis.service.ts
  - RedisService class (implements IRedisClient interface)
  - Methods: get(), set(), hget(), hset(), publish(), subscribe()
```

#### Story 4.2: Game State Storage in Redis
**Dependencies:** Story 4.1, Story 3.1 (Board, Move)
**Can be parallel with:** Story 4.1 (after RedisService exists)
**TDD Approach:**
- Write `RedisGameRepository.test.ts`:
  - Mock RedisService
  - Test create(), findByCode(), update()
  - Test BoardDTO serialization/deserialization
- Implement `RedisGameRepository` to pass tests
- Keep repository < 150 lines

**Code Structure:**
```
packages/server/src/infrastructure/redis/redis-game.repository.ts
  - RedisGameRepository class (implements IGameRepository)
  - Methods: create(), findByCode(), update()
  - Private: serializeGame(), deserializeGame()
```

**SOLID/DRY:**
- Implements domain interface (DIP)
- Repository pattern (SRP)
- Serialization logic extracted to private methods (DRY)

---

### Sprint 4: Application Layer - Game Services
**Goal:** Build business logic services that orchestrate domain and use infrastructure

**Stories (Sequential within Application layer):**

#### Story 3.3: Turn Management and Move Processing
**Dependencies:** Story 3.2 (MoveValidationService), Story 4.2 (RedisGameRepository)
**TDD Approach:**
- Write `GameStateService.test.ts`:
  - Mock IGameRepository
  - Test makeMove() with valid/invalid moves
  - Test turn alternation (X → O → X)
  - Test board updates
- Implement `GameStateService` to pass tests
- Keep service < 150 lines, methods < 15 lines

**Code Structure:**
```
packages/server/src/application/services/GameStateService.ts
  - makeMove() method
  - updateBoard() private method
  - alternateTurn() private method
```

#### Story 3.4: Win Condition Detection
**Dependencies:** Story 3.3
**TDD Approach:**
- Write `GameStateService.test.ts` (extend existing):
  - Test horizontal wins (all 3 rows)
  - Test vertical wins (all 3 columns)
  - Test diagonal wins (main + anti-diagonal)
  - Test no win scenarios
- Implement `checkWinCondition()` method
- Keep method < 30 lines (extract helper methods if needed)

**Code Structure:**
```
packages/server/src/application/services/GameStateService.ts
  - checkWinCondition() method
  - checkRow() private method
  - checkColumn() private method
  - checkDiagonals() private method
```

#### Story 3.5: Draw Condition Detection
**Dependencies:** Story 3.4
**TDD Approach:**
- Write `GameStateService.test.ts` (extend existing):
  - Test draw (full board, no winner)
  - Test not draw (full board with winner)
  - Test not draw (empty cells remain)
- Implement `checkDrawCondition()` method
- Keep method < 10 lines (uses Board.isFull())

---

### Sprint 5: Game Session Management (Epic 2)
**Goal:** Enable game creation and joining via WebSocket

**Stories (Sequential with some parallel opportunities):**

#### Story 2.1: WebSocket Server Setup with NestJS Gateway
**Dependencies:** Story 1.4
**TDD Approach:**
- Write `GameGateway.test.ts`:
  - Mock WebSocket connections
  - Test handleConnection(), handleDisconnect()
  - Test basic message routing
- Implement `GameGateway` skeleton
- Keep gateway < 300 lines initially

#### Story 2.2: Game Code Generation
**Dependencies:** Story 2.1
**TDD Approach:**
- Write `GameCodeGenerator.test.ts`:
  - Test code format (6 alphanumeric)
  - Test uniqueness
  - Test case sensitivity
- Implement `GameCodeGenerator` utility
- Keep generator < 100 lines

#### Story 2.3: Game Creation with Initial State
**Dependencies:** Story 2.2, Story 4.2 (RedisGameRepository)
**TDD Approach:**
- Write `CreateGameUseCase.test.ts`:
  - Mock IGameRepository
  - Test game creation with empty board
  - Test player X assignment
  - Test game code generation
- Implement `CreateGameUseCase`
- Keep use case < 150 lines

#### Story 2.4: Game Joining with Validation
**Dependencies:** Story 2.3
**TDD Approach:**
- Write `JoinGameUseCase.test.ts`:
  - Mock IGameRepository
  - Test joining waiting game (assigns O)
  - Test joining full game (rejects)
  - Test joining non-existent game (rejects)
- Implement `JoinGameUseCase`
- Keep use case < 150 lines

#### Story 2.6: Message Validation and Error Handling
**Dependencies:** Story 2.5
**Can be parallel with:** Story 2.3, 2.4
**TDD Approach:**
- Write `MessageValidator.test.ts`:
  - Test valid messages
  - Test invalid JSON
  - Test missing fields
  - Test invalid message types
- Implement `MessageValidator` utility
- Keep validator < 150 lines

#### Story 2.7: Connection Management and Cleanup
**Dependencies:** Story 2.1
**TDD Approach:**
- Write `ConnectionManager.test.ts`:
  - Test connection tracking
  - Test disconnection cleanup
  - Test game-player mapping
- Implement `ConnectionManager` service
- Keep manager < 150 lines

---

### Sprint 6: Core Gameplay Integration (Epic 3 - Server Side)
**Goal:** Integrate move processing with WebSocket gateway

**Stories:**

#### Story 3.3 Integration: Connect Move Processing to Gateway
**Dependencies:** Stories 2.1, 3.3, 3.4, 3.5
**TDD Approach:**
- Write `GameGateway.test.ts` (extend existing):
  - Test move message handling
  - Test update message broadcasting
  - Test win/draw message broadcasting
- Implement move handling in `GameGateway`
- Keep gateway methods < 30 lines each

#### Story 2.5 Integration: Message Protocol in Gateway
**Dependencies:** Story 2.5, Story 2.6
**TDD Approach:**
- Write integration tests:
  - Test join message → joined response
  - Test move message → update response
  - Test error message handling
- Wire message types into gateway

---

### Sprint 7: CLI Client (Epic 3 - Client Side)
**Goal:** Build CLI client interface - can develop in parallel with server work

**Stories (Can be parallel after Story 3.6):**

#### Story 3.6: CLI Client - WebSocket Connection
**Dependencies:** Story 1.5
**TDD Approach:**
- Write `WebSocketClient.test.ts`:
  - Mock ws library
  - Test connect(), disconnect(), send(), onMessage()
  - Test connection error handling
- Implement `WebSocketClient`
- Keep client < 150 lines

#### Story 3.7: CLI Client - Initial Board Display
**Dependencies:** Story 3.6, Story 1.3 (shared types)
**TDD Approach:**
- Write `BoardRenderer.test.ts`:
  - Test empty board rendering
  - Test board with moves rendering
  - Test row/column labels
- Implement `BoardRenderer`
- Keep renderer < 150 lines

#### Story 3.8: CLI Client - User Input Handling with Validation
**Dependencies:** Story 3.7
**TDD Approach:**
- Write `InputHandler.test.ts`:
  - Test valid input parsing ("1 1", "1,1", "1, 1")
  - Test invalid input (out of bounds, non-numeric)
  - Test retry on error
- Implement `InputHandler`
- Keep handler < 150 lines

#### Story 3.9: CLI Client - Turn-Based Input Control
**Dependencies:** Story 3.8
**TDD Approach:**
- Write `GameClientService.test.ts`:
  - Test input blocking when not turn
  - Test input acceptance when turn
  - Test status message display
- Implement turn state tracking
- Keep service < 150 lines

#### Story 3.10: CLI Client - Real-Time Board Updates
**Dependencies:** Story 3.9
**TDD Approach:**
- Write integration tests:
  - Test update message → board refresh
  - Test own move → board update
  - Test opponent move → board update
- Implement message handling
- Keep handlers < 30 lines each

#### Story 3.11: CLI Client - Win/Draw Notifications
**Dependencies:** Story 3.10
**TDD Approach:**
- Write `GameClientService.test.ts` (extend):
  - Test win message handling
  - Test draw message handling
  - Test notification display
- Implement notification handling
- Keep handlers < 30 lines each

---

### Sprint 8: Multi-Server Synchronization (Epic 4)
**Goal:** Enable real-time sync across servers

**Stories (Sequential):**

#### Story 4.3: Redis Pub/Sub for Server Synchronization
**Dependencies:** Story 4.1, Story 2.3
**TDD Approach:**
- Write `RedisService.test.ts` (extend):
  - Mock ioredis pub/sub
  - Test publish() to channel
  - Test message format
- Implement publishing logic
- Keep logic < 100 lines

#### Story 4.4: Server Subscription to Sync Channels
**Dependencies:** Story 4.3
**TDD Approach:**
- Write `SyncService.test.ts`:
  - Mock RedisService subscribe
  - Test channel subscription
  - Test message handling
- Implement `SyncGameStateUseCase`
- Keep use case < 150 lines

#### Story 4.5: Cross-Server State Consistency
**Dependencies:** Story 4.4, Story 3.3
**TDD Approach:**
- Write integration tests:
  - Test move on Server A → Server B receives update
  - Test state consistency after sync
  - Test client updates on both servers
- Implement sync message processing
- Keep processing < 150 lines

#### Story 4.6: Synchronization Error Handling
**Dependencies:** Story 4.5
**TDD Approach:**
- Write `SyncService.test.ts` (extend):
  - Test Redis connection failure handling
  - Test pub/sub failure handling
  - Test message parsing errors
- Implement error handling
- Keep handlers < 50 lines each

---

## Parallel Development Opportunities

### Phase 1: Foundation Complete
**After Sprint 0:**
- ✅ Domain layer (Story 3.1) can start
- ✅ Shared types (Story 2.5) can start in parallel

### Phase 2: Domain Complete
**After Sprint 1:**
- ✅ Application layer (Story 3.2) can start
- ✅ Infrastructure layer (Stories 4.1, 4.2) can start in parallel
- ✅ Both depend only on Domain (no circular dependencies)

### Phase 3: Application + Infrastructure Complete
**After Sprints 2-3:**
- ✅ Game Session Management (Epic 2) can start
- ✅ CLI Client (Epic 3 client stories) can start in parallel
- ✅ Both use shared types and can develop independently

### Phase 4: Integration
**After Sprints 4-7:**
- ✅ Multi-Server Sync (Epic 4) integrates everything
- ✅ End-to-end testing can begin

---

## Sprint Summary

| Sprint | Focus | Stories | Parallel Opportunities |
|--------|-------|---------|----------------------|
| Sprint 0 | Foundation | 7 stories (Epic 1) | None (sequential) |
| Sprint 1 | Domain Layer | Story 3.1 | Story 2.5 (shared types) |
| Sprint 2 | Application Foundation | Story 3.2 | Story 4.1 (Redis setup) |
| Sprint 3 | Infrastructure | Stories 4.1, 4.2 | Story 3.2 (if not done) |
| Sprint 4 | Application Services | Stories 3.3, 3.4, 3.5 | None (sequential) |
| Sprint 5 | Game Session Mgmt | Stories 2.1-2.7 | Story 2.6 parallel with 2.3-2.4 |
| Sprint 6 | Server Integration | Epic 3 server integration | None (sequential) |
| Sprint 7 | CLI Client | Stories 3.6-3.11 | Can parallel with Sprint 5-6 |
| Sprint 8 | Multi-Server Sync | Stories 4.3-4.6 | None (sequential) |

**Total:** 8 sprints, 24 stories

---

## Code Quality Checklist (Per Story)

**Before marking story complete:**
- [ ] All tests written FIRST (TDD)
- [ ] All tests passing (100%)
- [ ] Code follows SOLID principles
- [ ] No code duplication (DRY)
- [ ] Classes < 150 lines
- [ ] Methods < 15 lines
- [ ] Test files can be longer (up to 500 lines) with clear AAA structure
- [ ] One class per file
- [ ] Interfaces defined for dependencies
- [ ] Error handling implemented
- [ ] Code reviewed (self-review minimum)

---

## Testing Strategy by Layer

**Domain Layer:**
- Pure unit tests (no mocks)
- 100% coverage
- Test all edge cases

**Application Layer:**
- Unit tests with mocked interfaces
- 90%+ coverage
- Test business logic thoroughly

**Infrastructure Layer:**
- Unit tests with mocked external systems
- Integration tests with real Redis (Docker)
- 80%+ coverage

**Presentation Layer:**
- Unit tests with mocked services
- Integration tests with test WebSocket clients
- E2E tests for full flows

---

**Planning Complete!** Ready to start Sprint 0.

