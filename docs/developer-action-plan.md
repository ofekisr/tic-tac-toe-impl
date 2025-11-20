# Developer Action Plan: Fix All Issues and Complete Missing Tasks

**Generated:** 2025-01-27  
**Project:** fusion-tic-tac-toe  
**Purpose:** Comprehensive checklist for fixing all issues and completing missing implementations

---

## Executive Summary

This document identifies all missing implementations, incomplete stories, and issues that need to be resolved to complete the MVP. The system is approximately **40% complete**:

- ✅ **Epic 1 (Foundation):** Mostly complete (7/7 stories, some in review)
- ⚠️ **Epic 2 (Game Session Management):** Partially complete (4/7 stories done, 3 in review)
- ❌ **Epic 3 (Core Gameplay):** Not started (0/11 stories)
- ⚠️ **Epic 4 (Multi-Server Sync):** Partially complete (subscription exists, but stories not tracked)

---

## Priority Order

**Phase 1: Complete Epic 2 Reviews** (High Priority)
- Finish review items to get Epic 2 to 100% done
- Ensures game creation/joining is solid before gameplay

**Phase 2: Complete Epic 3 Core Gameplay** (Critical)
- Enables actual gameplay (players can make moves)
- Required for MVP validation

**Phase 3: Complete Epic 4 Multi-Server Sync** (High Value)
- Enables the core innovation (cross-server synchronization)
- Required for full MVP

**Phase 4: Code Quality & Testing** (Ongoing)
- Ensure all tests pass
- Fix any architectural violations
- Complete missing test coverage

---

## Phase 1: Complete Epic 2 Reviews

### Story 2.3: Game Creation with Initial State
**Status:** `review`  
**Location:** `docs/sprint-artifacts/2-3-game-creation-with-initial-state.md`

**Issues to Verify:**
- [ ] Verify `CreateGameUseCase` creates game with correct initial state
- [ ] Verify TTL (3600 seconds) is set correctly
- [ ] Verify `joined` message includes all required fields (board, currentPlayer, status, playerSymbol)
- [ ] Verify game state is stored in Redis correctly
- [ ] Verify sync message is published after game creation
- [ ] Run integration tests to verify end-to-end flow
- [ ] Update sprint status to `done` after verification

**Files to Review:**
- `packages/server/src/application/use-cases/CreateGameUseCase.ts`
- `packages/server/src/application/use-cases/CreateGameUseCase.spec.ts`
- `packages/server/src/presentation/game/game.gateway.ts` (handleJoinMessage method)

---

### Story 2.4: Game Joining with Validation
**Status:** `review`  
**Location:** `docs/sprint-artifacts/2-4-game-joining-with-validation.md`

**Issues to Verify:**
- [ ] Verify game code validation (game exists)
- [ ] Verify game status validation (must be 'waiting')
- [ ] Verify game capacity validation (only one player)
- [ ] Verify player 'O' assignment
- [ ] Verify game status updates to 'playing'
- [ ] Verify both clients receive correct messages (joined vs update)
- [ ] Verify error handling for GAME_FULL case
- [ ] Verify error handling for GAME_NOT_FOUND case
- [ ] Run integration tests with two clients
- [ ] Update sprint status to `done` after verification

**Files to Review:**
- `packages/server/src/application/use-cases/JoinGameUseCase.ts`
- `packages/server/src/application/use-cases/JoinGameUseCase.spec.ts`
- `packages/server/src/presentation/game/game.gateway.ts` (handleJoinMessage method)

---

### Story 2.6: Message Validation and Error Handling
**Status:** `review`  
**Location:** `docs/sprint-artifacts/2-6-message-validation-and-error-handling.md`

**Issues to Verify:**
- [ ] Verify JSON validation (malformed JSON)
- [ ] Verify required field validation (type, gameCode, row, col)
- [ ] Verify message type validation (only 'join' and 'move' allowed)
- [ ] Verify error messages are user-friendly
- [ ] Verify error codes match ErrorCode enum
- [ ] Test all error scenarios
- [ ] Update sprint status to `done` after verification

**Files to Review:**
- `packages/server/src/application/services/MessageValidator.ts`
- `packages/server/src/application/services/MessageValidator.spec.ts`
- `packages/server/src/application/utils/ErrorResponseBuilder.ts`

---

### Story 2.7: Connection Management and Cleanup
**Status:** `review`  
**Location:** `docs/sprint-artifacts/2-7-connection-management-and-cleanup.md`

**Issues to Verify:**
- [ ] Verify disconnection detection works
- [ ] Verify connection cleanup removes connection from tracking
- [ ] Verify game state is updated on disconnection (if needed)
- [ ] Verify no memory leaks (connection tracking cleanup)
- [ ] Test disconnection scenarios (client closes, network error)
- [ ] Verify logging for disconnection events
- [ ] Update sprint status to `done` after verification

**Files to Review:**
- `packages/server/src/application/services/ConnectionManager.ts`
- `packages/server/src/application/use-cases/UpdateGameOnDisconnectionUseCase.ts`
- `packages/server/src/presentation/game/game.gateway.ts` (handleDisconnect method)

---

### Epic 1 Stories in Review

#### Story 1.1: Project Structure
**Status:** `review`  
**Action:** Verify project structure matches requirements, update to `done`

#### Story 1.3: Shared Types Package Setup
**Status:** `review`  
**Action:** Verify all types are exported correctly, update to `done`

#### Story 1.6: Docker Compose Configuration
**Status:** `review`  
**Action:** Verify docker-compose.yml works, update to `done`

---

## Phase 2: Complete Epic 3 Core Gameplay

### Story 3.1: Domain Layer - Board and Move Value Objects
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.1)

**Tasks:**
- [ ] Verify Board class exists in `packages/shared/src/types/game.ts`
- [ ] Verify Board has all required methods: `getCell()`, `setCell()`, `isEmpty()`, `isFull()`, `toArray()`, `fromArray()`
- [ ] Verify Move class exists in `packages/shared/src/types/game.ts`
- [ ] Verify Move has `row`, `col`, `player`, `timestamp` properties
- [ ] Verify Move has `toPosition()` and `equals()` methods
- [ ] Write unit tests for Board class
- [ ] Write unit tests for Move class
- [ ] Verify no external dependencies (pure TypeScript)
- [ ] Create story file: `docs/sprint-artifacts/3-1-domain-layer-board-and-move-value-objects.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 700-730

---

### Story 3.2: Move Validation Service
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.2)

**Tasks:**
- [ ] Verify `MoveValidationService` exists: `packages/server/src/application/services/MoveValidationService.ts`
- [ ] Verify validation checks:
  - [ ] Game exists and is in 'playing' status
  - [ ] It's the requesting player's turn
  - [ ] Cell is empty
  - [ ] Position is valid (0-2 range)
  - [ ] Game is not finished
- [ ] Verify error codes returned match ErrorCode enum
- [ ] Write comprehensive unit tests
- [ ] Verify tests cover all validation scenarios
- [ ] Create story file: `docs/sprint-artifacts/3-2-move-validation-service.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 734-766

---

### Story 3.3: Turn Management and Move Processing
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.3)

**CRITICAL ISSUE:** `MakeMoveUseCase` does not exist, but `GameGateway` calls `gameStateService.makeMove()` directly. This violates the use case pattern.

**Tasks:**
- [ ] **Create `MakeMoveUseCase`:** `packages/server/src/application/use-cases/MakeMoveUseCase.ts`
  - [ ] Inject dependencies: `IGameRepository`, `GameService`, `MoveValidationService`, `GameStateService`, `ConnectionManager`, `GameSyncService`
  - [ ] Implement `execute(gameCode: string, move: Move, playerSymbol: PlayerSymbol): Promise<GameState>`
  - [ ] Validate move using `MoveValidationService`
  - [ ] Update game state using `GameStateService`
  - [ ] Save to Redis using `IGameRepository`
  - [ ] Publish sync message using `GameSyncService`
  - [ ] Return updated `GameState`
- [ ] **Update `GameGateway`:** Replace direct `gameStateService.makeMove()` call with `MakeMoveUseCase.execute()`
- [ ] **Write unit tests:** `packages/server/src/application/use-cases/MakeMoveUseCase.spec.ts`
- [ ] **Verify turn alternation:** After X moves → currentPlayer becomes 'O', after O moves → currentPlayer becomes 'X'
- [ ] **Verify error handling:** NOT_YOUR_TURN error when wrong player tries to move
- [ ] **Verify both players receive update messages**
- [ ] Create story file: `docs/sprint-artifacts/3-3-turn-management-and-move-processing.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 770-805  
**Current Implementation:** `packages/server/src/presentation/game/game.gateway.ts` lines 300-395

---

### Story 3.4: Win Condition Detection
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.4)

**Tasks:**
- [ ] Verify `GameStateService.checkWinCondition()` exists
- [ ] Verify win detection checks:
  - [ ] Horizontal wins (3 rows)
  - [ ] Vertical wins (3 columns)
  - [ ] Diagonal wins (2 diagonals)
- [ ] Verify win detection returns `PlayerSymbol | null`
- [ ] Verify win detection runs after every move
- [ ] Verify game status updates to 'finished' when win detected
- [ ] Verify winner is set correctly
- [ ] Verify `win` message is sent to both players
- [ ] Write unit tests for all 8 winning combinations
- [ ] Create story file: `docs/sprint-artifacts/3-4-win-condition-detection.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 809-842

---

### Story 3.5: Draw Condition Detection
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.5)

**Tasks:**
- [ ] Verify draw detection exists in `GameStateService`
- [ ] Verify draw detection checks:
  - [ ] Board is full (`board.isFull()`)
  - [ ] No winner (`checkWinCondition()` returns null)
- [ ] Verify draw detection runs after win check
- [ ] Verify game status updates to 'finished' when draw detected
- [ ] Verify winner remains `null` for draws
- [ ] Verify `draw` message is sent to both players
- [ ] Write unit tests for draw scenarios
- [ ] Create story file: `docs/sprint-artifacts/3-5-draw-condition-detection.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 846-877

---

### Story 3.6: CLI Client - WebSocket Connection
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.6)

**Tasks:**
- [ ] Verify `WebSocketClient` exists: `packages/client/src/infrastructure/websocket/WebSocketClient.ts`
- [ ] Verify all required methods:
  - [ ] `connect(url: string): Promise<void>`
  - [ ] `disconnect(): Promise<void>`
  - [ ] `send(message: ClientMessage): void`
  - [ ] `onMessage(handler: (message: ServerMessage) => void): void`
  - [ ] `onError(handler: (error: Error) => void): void`
  - [ ] `onClose(handler: () => void): void`
  - [ ] `isConnected(): boolean`
- [ ] Verify connection to Server A (port 3001) works
- [ ] Verify connection to Server B (port 3002) works
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/3-6-cli-client-websocket-connection.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 881-914

---

### Story 3.7: CLI Client - Initial Board Display
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.7)

**Tasks:**
- [ ] Verify `BoardRenderer` exists: `packages/client/src/presentation/cli/BoardRenderer.ts`
- [ ] Verify `renderBoard(board: BoardDTO): string` method
- [ ] Verify `displayBoard(board: BoardDTO): void` method
- [ ] Verify board displays with row/column labels (0, 1, 2)
- [ ] Verify empty cells shown as `[ ]`
- [ ] Verify board displays immediately on `joined` message
- [ ] Test board rendering with various states
- [ ] Create story file: `docs/sprint-artifacts/3-7-cli-client-initial-board-display.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 918-953  
**Current Implementation:** `packages/client/src/presentation/cli/BoardRenderer.ts` exists, verify completeness

---

### Story 3.8: CLI Client - User Input Handling with Validation
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.8)

**Tasks:**
- [ ] Verify `InputHandler` exists: `packages/client/src/presentation/cli/InputHandler.ts`
- [ ] Verify `parseInput(input: string): { row: number, col: number } | null`
- [ ] Verify `validateInput(row: number, col: number): boolean`
- [ ] Verify `promptForMove(): Promise<{ row: number, col: number }>`
- [ ] Verify input formats supported: "1 1", "1,1", "1, 1"
- [ ] Verify validation checks:
  - [ ] Both row and col provided
  - [ ] Values are numbers (0, 1, or 2)
  - [ ] Values are within bounds (0-2)
- [ ] Verify error messages are clear
- [ ] Verify retry on invalid input
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/3-8-cli-client-user-input-handling-with-validation.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 957-995  
**Current Implementation:** `packages/client/src/presentation/cli/InputHandler.ts` exists, verify completeness

---

### Story 3.9: CLI Client - Turn-Based Input Control
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.9)

**Tasks:**
- [ ] Verify turn state tracking in `GameClient`
- [ ] Verify input is ignored when `currentPlayer !== playerSymbol`
- [ ] Verify "Waiting for opponent's move..." message shown
- [ ] Verify input is accepted when `currentPlayer === playerSymbol`
- [ ] Verify turn state updates from server messages
- [ ] Test turn-based input blocking
- [ ] Create story file: `docs/sprint-artifacts/3-9-cli-client-turn-based-input-control.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 999-1031  
**Current Implementation:** `packages/client/src/presentation/cli/GameClient.ts` lines 31-32, 127, 148 track turn state

---

### Story 3.10: CLI Client - Real-Time Board Updates
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.10)

**Tasks:**
- [ ] Verify board updates on `update` message
- [ ] Verify board updates on `win` message
- [ ] Verify board updates on `draw` message
- [ ] Verify board displays after own move
- [ ] Verify board displays after opponent move
- [ ] Verify board refresh is automatic (no user action)
- [ ] Test real-time update flow
- [ ] Create story file: `docs/sprint-artifacts/3-10-cli-client-real-time-board-updates.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1035-1070  
**Current Implementation:** `packages/client/src/presentation/cli/GameClient.ts` handles update messages

---

### Story 3.11: CLI Client - Win/Draw Notifications
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 3.11)

**Tasks:**
- [ ] Verify win notification displays correctly
- [ ] Verify "You won!" message when `winner === playerSymbol`
- [ ] Verify "You lost!" message when `winner !== playerSymbol`
- [ ] Verify draw notification displays correctly
- [ ] Verify final board state is displayed
- [ ] Verify input is disabled after game ends
- [ ] Test all notification scenarios
- [ ] Create story file: `docs/sprint-artifacts/3-11-cli-client-win-draw-notifications.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1074-1106  
**Current Implementation:** `packages/client/src/presentation/cli/GameClient.ts` lines 163-181 handle win/draw

---

## Phase 3: Complete Epic 4 Multi-Server Synchronization

### Story 4.1: Redis Integration Setup
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.1)

**Tasks:**
- [ ] Verify `RedisService` exists: `packages/server/src/infrastructure/redis/redis.service.ts`
- [ ] Verify all required methods:
  - [ ] `get()`, `set()`, `hget()`, `hset()`, `hgetall()`
  - [ ] `publish()`, `subscribe()`, `unsubscribe()`
- [ ] Verify connection configuration from environment variables
- [ ] Verify error handling for connection failures
- [ ] Verify `RedisModule` provides `RedisService`
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/4-1-redis-integration-setup.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1114-1148

---

### Story 4.2: Game State Storage in Redis
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.2)

**Tasks:**
- [ ] Verify `RedisGameRepository` exists: `packages/server/src/infrastructure/redis/redis-game.repository.ts`
- [ ] Verify implements `IGameRepository` interface
- [ ] Verify game state stored as hash at `game:{gameCode}`
- [ ] Verify all fields stored correctly:
  - [ ] `board`: JSON string of BoardDTO
  - [ ] `currentPlayer`: 'X' or 'O'
  - [ ] `status`: 'waiting' | 'playing' | 'finished'
  - [ ] `winner`: 'X' | 'O' | null
  - [ ] `players`: JSON string of `{ X?: string, O?: string }`
  - [ ] `createdAt`, `updatedAt`: ISO timestamp strings
- [ ] Verify TTL (3600 seconds) is set
- [ ] Verify conversion between domain `Game` and Redis hash format
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/4-2-game-state-storage-in-redis.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1152-1186

---

### Story 4.3: Redis Pub/Sub for Server Synchronization
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.3)

**Tasks:**
- [ ] Verify `GameSyncService` exists: `packages/server/src/application/services/GameSyncService.ts`
- [ ] Verify `publishGameUpdate()` method exists
- [ ] Verify publishes to channel `game:sync:{gameCode}`
- [ ] Verify message format: `{ gameCode: string, event: 'move' | 'join' | 'win' | 'draw', state: GameStateDTO }`
- [ ] Verify publishing happens after:
  - [ ] Game creation
  - [ ] Player joins
  - [ ] Move is made
  - [ ] Win/draw detected
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/4-3-redis-pub-sub-for-server-synchronization.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1190-1220  
**Current Implementation:** `packages/server/src/application/services/GameSyncService.ts` exists, verify completeness

---

### Story 4.4: Server Subscription to Sync Channels
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.4)

**Tasks:**
- [ ] Verify `GameSyncSubscriptionService` exists: `packages/server/src/application/services/GameSyncSubscriptionService.ts`
- [ ] Verify subscribes to pattern `game:sync:*` on module init
- [ ] Verify unsubscribes on module destroy
- [ ] Verify message handler processes sync messages
- [ ] Verify reads updated game state from Redis
- [ ] Verify broadcasts update to connected clients
- [ ] Verify error handling for subscription failures
- [ ] Verify retry logic for failed subscriptions
- [ ] Write unit tests
- [ ] Create story file: `docs/sprint-artifacts/4-4-server-subscription-to-sync-channels.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1224-1260  
**Current Implementation:** `packages/server/src/application/services/GameSyncSubscriptionService.ts` exists and looks complete, verify all requirements

---

### Story 4.5: Cross-Server State Consistency
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.5)

**Tasks:**
- [ ] **Integration Test:** Player X on Server A, Player O on Server B
- [ ] Verify move on Server A appears on Server B client
- [ ] Verify both servers have identical game state after sync
- [ ] Verify board state matches across servers
- [ ] Verify current player matches across servers
- [ ] Verify game status matches across servers
- [ ] Verify synchronization latency < 200ms
- [ ] Test multiple concurrent games
- [ ] Create story file: `docs/sprint-artifacts/4-5-cross-server-state-consistency.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1264-1296

---

### Story 4.6: Synchronization Error Handling
**Status:** `backlog`  
**Location:** `docs/epics.md` (Story 4.6)

**Tasks:**
- [ ] Verify error handling for Redis connection failures
- [ ] Verify error handling for pub/sub subscription failures
- [ ] Verify error handling for message parsing errors
- [ ] Verify error handling for state read/write failures
- [ ] Verify reconnection logic with exponential backoff
- [ ] Verify error logging with context
- [ ] Verify graceful degradation when Redis unavailable
- [ ] Write unit tests for error scenarios
- [ ] Create story file: `docs/sprint-artifacts/4-6-synchronization-error-handling.md`
- [ ] Update sprint status to `done`

**Reference:** `docs/epics.md` lines 1300-1335

---

## Phase 4: Code Quality & Testing

### Architectural Issues

#### Issue 1: Missing MakeMoveUseCase
**Severity:** High  
**Location:** `packages/server/src/presentation/game/game.gateway.ts` line 322

**Problem:** `GameGateway` calls `gameStateService.makeMove()` directly, violating the use case pattern.

**Fix:**
1. Create `MakeMoveUseCase` (see Story 3.3 tasks)
2. Update `GameGateway` to use `MakeMoveUseCase.execute()`
3. Remove direct dependency on `GameStateService` from Gateway

---

#### Issue 2: Verify Layered Architecture Compliance
**Severity:** Medium

**Tasks:**
- [ ] Verify no Domain → Infrastructure dependencies
- [ ] Verify no Application → Infrastructure direct dependencies (use interfaces)
- [ ] Verify no Presentation → Domain direct dependencies (use Application layer)
- [ ] Run dependency analysis tool if available
- [ ] Document any violations found

---

### Testing Gaps

#### Unit Test Coverage
**Tasks:**
- [ ] Verify all domain entities have tests (Game, GameCode, Board, Move)
- [ ] Verify all application services have tests
- [ ] Verify all use cases have tests
- [ ] Verify all infrastructure implementations have tests
- [ ] Run coverage report: `npm run test:coverage`
- [ ] Target: 80%+ coverage overall, 100% for domain layer

#### Integration Tests
**Tasks:**
- [ ] End-to-end test: Create game → Join game → Make moves → Win/draw
- [ ] Multi-server test: Two clients on different servers → Verify sync
- [ ] Error scenario tests: Invalid moves, disconnections, Redis failures
- [ ] Load test: Multiple concurrent games

---

### Documentation Updates

**Tasks:**
- [ ] Update `README.md` with current status
- [ ] Verify all story files exist in `docs/sprint-artifacts/`
- [ ] Update `docs/sprint-status.yaml` after each story completion
- [ ] Document any architectural decisions made during implementation
- [ ] Update API documentation if needed

---

## Quick Reference: File Locations

### Server Implementation
- **Use Cases:** `packages/server/src/application/use-cases/`
- **Services:** `packages/server/src/application/services/`
- **Domain:** `packages/server/src/domain/`
- **Infrastructure:** `packages/server/src/infrastructure/`
- **Presentation:** `packages/server/src/presentation/`

### Client Implementation
- **CLI:** `packages/client/src/presentation/cli/`
- **WebSocket:** `packages/client/src/infrastructure/websocket/`
- **Application:** `packages/client/src/application/`
- **Domain:** `packages/client/src/domain/`

### Shared Types
- **Types:** `packages/shared/src/types/`

### Documentation
- **Epics:** `docs/epics.md`
- **Stories:** `docs/sprint-artifacts/*.md`
- **Sprint Status:** `docs/sprint-status.yaml`
- **Architecture:** `docs/architecture.md`
- **PRD:** `docs/prd.md`

---

## Testing Commands

```bash
# Run all tests
npm test

# Run server tests
cd packages/server && npm test

# Run client tests
cd packages/client && npm test

# Run with coverage
npm run test:coverage

# Run integration tests (when available)
npm run test:integration
```

---

## Development Workflow

1. **Pick a story** from the backlog
2. **Read the story file** in `docs/sprint-artifacts/`
3. **Read acceptance criteria** in `docs/epics.md`
4. **Write tests first** (TDD)
5. **Implement the feature**
6. **Run tests** and fix issues
7. **Update sprint status** in `docs/sprint-status.yaml`
8. **Mark story as done**

---

## Success Criteria

**MVP is complete when:**
- ✅ All Epic 2 stories are `done`
- ✅ All Epic 3 stories are `done`
- ✅ All Epic 4 stories are `done`
- ✅ End-to-end test passes: Two players can play a complete game
- ✅ Multi-server sync test passes: Players on different servers see moves in real-time
- ✅ All tests pass (unit + integration)
- ✅ Code coverage > 80%
- ✅ No architectural violations
- ✅ Documentation is up to date

---

## Notes

- **TDD Required:** Write tests before implementation
- **Architecture:** Follow layered architecture strictly
- **Error Handling:** All error paths must be tested
- **Logging:** Use structured logging with context
- **Code Review:** Self-review minimum before marking done

---

**Last Updated:** 2025-01-27  
**Next Review:** After Phase 1 completion

