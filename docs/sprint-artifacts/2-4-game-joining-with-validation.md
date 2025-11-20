# Story 2.4: Game Joining with Validation

Status: review

## Story

As a player,
I want to join an existing game using a game code,
So that I can play against the game creator.

## Acceptance Criteria

1. **Given** a game exists with status `'waiting'` and one player (X)
   **When** a second client sends `{ type: 'join', gameCode: 'ABC123' }` message
   **Then** the server:
   - Validates game code exists in Redis
   - Validates game status is `'waiting'` (not `'playing'` or `'finished'`)
   - Validates game has space (only one player currently)
   - Assigns player 'O' to the joining client
   - Updates game state:
     - Status: `'playing'`
     - Players: `{ X: 'connection-id-1', O: 'connection-id-2' }`
     - Current player: `'X'` (first player's turn)
   - Stores updated game state in Redis
   - Sends `joined` message to joining client with:
     - `type: 'joined'`
     - `gameCode: string`
     - `board: BoardDTO` (current board state)
     - `currentPlayer: 'X'`
     - `status: 'playing'`
     - `playerSymbol: 'O'`
   - Sends `update` message to first client (X) with:
     - `type: 'update'`
     - `gameCode: string`
     - `board: BoardDTO`
     - `currentPlayer: 'X'`
     - `status: 'playing'`

2. **Given** a game exists with status `'playing'` (two players already)
   **When** a third client tries to join
   **Then** the server sends error message:
   - `type: 'error'`
   - `code: 'GAME_FULL'`
   - `message: 'Game already has two players'`

## Tasks / Subtasks

- [x] Task 1: Implement JoinGameUseCase (AC: #1)
  - [x] Create `packages/server/src/application/use-cases/JoinGameUseCase.ts`
  - [x] Inject `IGameRepository`
  - [x] Implement `execute(gameCode: string, connectionId: string): Promise<JoinedGameResult>`
  - [x] Load game from repository by game code
  - [x] Validate game exists (throw error if not found)
  - [x] Validate game status is 'waiting' (throw error if not)
  - [x] Validate game has space (only one player) (throw error if full)
  - [x] Assign player 'O' to connectionId
  - [x] Update game status to 'playing'
  - [x] Update players object with both connection IDs
  - [x] Set currentPlayer to 'X' (first player's turn)
  - [x] Save updated game to repository
  - [x] Return JoinedGameResult with game state and player symbol
  - [x] Test: Mock repository and test successful join flow
  - [x] Test: Test validation errors (game not found, game full, game already playing)

- [x] Task 2: Handle join in Gateway (AC: #1, #2)
  - [x] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [x] Inject `JoinGameUseCase`
  - [x] Add message handler for `{ type: 'join', gameCode: string }` (where gameCode !== 'NEW')
  - [x] Call `JoinGameUseCase.execute(gameCode, connectionId)`
  - [x] On success: Send `joined` message to joining client
  - [x] On success: Send `update` message to first client (X)
  - [x] On error: Send `error` message with appropriate error code
  - [x] Test: Integration test with two WebSocket clients
  - [x] Test: Verify both clients receive correct messages
  - [x] Test: Verify error handling for full game

- [x] Task 3: Implement connection tracking (AC: #1)
  - [x] ConnectionManager already exists in `packages/server/src/application/services/ConnectionManager.ts`
  - [x] Track connection ID to game code mapping
  - [x] Track connection ID to player symbol mapping
  - [x] Methods exist: `registerConnection(connectionId, gameCode, playerSymbol)`, `getGameCode(connectionId)`, `getPlayerSymbol(connectionId)`
  - [x] Test: Verify connection tracking works correctly
  - [x] Test: Verify can retrieve game code and player symbol by connection ID

- [x] Task 4: Add error types to shared package (AC: #2)
  - [x] Open `packages/shared/src/types/errors.ts`
  - [x] Verify `ErrorCode` enum includes: `GAME_FULL`, `GAME_NOT_FOUND` (already exist)
  - [x] Verify `ErrorMessage` type uses ErrorCode enum (already correct)
  - [x] Test: Verify error types compile correctly

- [x] Task 5: Update message types (AC: #1)
  - [x] Open `packages/shared/src/types/messages.ts`
  - [x] Verify `UpdateMessage` type includes all required fields (already correct)
  - [x] Verify `ErrorMessage` type includes code field (already correct)
  - [x] Test: Verify message types match specification

## Dev Notes

### Learnings from Previous Story

**From Story 2.3 (Status: drafted)**

- **Game Entity**: Game entity exists with initial state structure [Source: docs/sprint-artifacts/2-3-game-creation-with-initial-state.md]
- **CreateGameUseCase**: CreateGameUseCase implemented for game creation [Source: docs/sprint-artifacts/2-3-game-creation-with-initial-state.md]
- **Redis Repository**: RedisGameRepository implements IGameRepository for game storage [Source: docs/sprint-artifacts/2-3-game-creation-with-initial-state.md]
- **Message Types**: JoinGameMessage and JoinedMessage types defined in shared package [Source: docs/sprint-artifacts/2-3-game-creation-with-initial-state.md]
- **Use Existing**: Reuse Game entity, repository, and message types for join flow

### Architecture Patterns and Constraints

- **Use Case Pattern**: Follow same pattern as CreateGameUseCase for JoinGameUseCase [Source: docs/architecture.md#Project-Structure]
- **Validation Logic**: Join validation prevents joining started/finished games (FR2 enhancement) [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]
- **Player Assignment**: Player assignment tracks which connection is X and which is O [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]
- **Message Broadcasting**: Both clients receive appropriate messages (joined vs update) [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]
- **Error Handling**: Error handling provides clear feedback for invalid join attempts [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]
- **Connection Tracking**: Connection tracking enables message routing to specific clients [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]

### Project Structure Notes

- Use case: `packages/server/src/application/use-cases/JoinGameUseCase.ts`
- Connection manager: `packages/server/src/application/services/ConnectionManager.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Error types: `packages/shared/src/types/errors.ts`
- Message types: `packages/shared/src/types/messages.ts`
- Connection tracking needed for routing messages to correct clients

### Testing Standards

- Use cases: Unit tests with mocked repository (90%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Gateway: Integration tests with test WebSocket clients [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Test all validation scenarios (game not found, game full, game already started)
- Test message broadcasting to both clients
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.4-Game-Joining-with-Validation]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/prd.md#Functional-Requirements]
- [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

**Implementation Summary:**
- Created JoinGameUseCase with comprehensive validation (game exists, status is waiting, has space)
- Updated GameGateway to handle join messages (non-NEW game codes)
- Added connectionIdToClient mapping for message broadcasting
- Gateway sends joined message to joining client (O) and update message to first client (X)
- Error handling for game not found, game full, and game not in waiting status
- ConnectionManager already existed from Story 2.7, verified and used
- Error codes and message types already exist in shared package
- All tests passing (94 tests total, 100% pass rate)
- Message broadcasting works correctly for both clients

### File List

- `packages/server/src/application/use-cases/JoinGameUseCase.ts` - Game joining use case with validation
- `packages/server/src/application/use-cases/JoinGameUseCase.spec.ts` - Use case tests
- `packages/server/src/presentation/game/game.gateway.ts` - Updated to handle join messages and broadcast to both clients
- `packages/server/src/presentation/game/game.gateway.spec.ts` - Updated Gateway tests
- `packages/server/src/presentation/game/game.module.ts` - Added JoinGameUseCase provider

## Change Log

- 2025-11-20: Story created from Epic 2 breakdown
- 2025-01-27: Story implementation complete - JoinGameUseCase implemented with validation, Gateway updated to handle join messages and broadcast to both clients. All tests passing (94 tests, 100% pass rate).

