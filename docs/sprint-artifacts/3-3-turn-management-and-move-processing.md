# Story 3.3: Turn Management and Move Processing

Status: drafted

## Story

As a player,
I want moves to be processed only when it's my turn,
So that turn order is enforced correctly.

## Acceptance Criteria

1. **Given** a valid move request from player X
   **When** currentPlayer is 'X' and game status is 'playing'
   **Then** the server:
   - Validates move (Story 3.2)
   - Updates board: sets cell at (row, col) to 'X'
   - Updates currentPlayer to 'O' (alternates turn)
   - Updates game state in Redis
   - Sends `update` message to both players with new board state

2. **Given** a move request from player X
   **When** currentPlayer is 'O' (not X's turn)
   **Then** server sends error:
   - `type: 'error'`
   - `code: 'NOT_YOUR_TURN'`
   - `message: "It's not your turn. Current player: O"`

3. **And** turn alternation logic:
   - After X moves → currentPlayer becomes 'O'
   - After O moves → currentPlayer becomes 'X'
   - Turn alternation happens automatically after valid move

## Tasks / Subtasks

- [ ] Task 1: Create GameStateService (AC: #1, #3)
  - [ ] Create `packages/server/src/application/services/GameStateService.ts`
  - [ ] Inject `IGameRepository` and `MoveValidationService`
  - [ ] Implement `makeMove(gameCode: string, move: Move, playerSymbol: PlayerSymbol): Promise<GameDTO>`
  - [ ] Implement `updateBoard(game: Game, move: Move): Game` private method
  - [ ] Implement `alternateTurn(game: Game): Game` private method
  - [ ] Keep service < 150 lines, methods < 15 lines
  - [ ] Test: Write `GameStateService.test.ts` FIRST with AAA pattern
  - [ ] Test: Mock IGameRepository
  - [ ] Test: Verify makeMove() with valid moves
  - [ ] Test: Verify turn alternation (X → O → X)
  - [ ] Test: Verify board updates correctly
  - [ ] Test: Verify invalid moves are rejected (uses MoveValidationService)

- [ ] Task 2: Integrate MoveValidationService (AC: #1)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] Inject `MoveValidationService` in constructor
  - [ ] Call `MoveValidationService.validateMove()` before processing
  - [ ] Handle validation errors and return appropriate error response
  - [ ] Test: Verify validation is called before move processing
  - [ ] Test: Verify validation errors are propagated correctly

- [ ] Task 3: Implement board update logic (AC: #1)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] Implement `updateBoard()` private method
  - [ ] Use `Board.setCell()` to update cell at move position
  - [ ] Update game entity with new board state
  - [ ] Test: Verify board is updated correctly after move
  - [ ] Test: Verify cell contains correct player symbol

- [ ] Task 4: Implement turn alternation logic (AC: #1, #3)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] Implement `alternateTurn()` private method
  - [ ] Logic: if currentPlayer is 'X', set to 'O'; else set to 'X'
  - [ ] Update game entity with new currentPlayer
  - [ ] Test: Verify turn alternates correctly (X → O → X)
  - [ ] Test: Verify turn alternation happens after every valid move

- [ ] Task 5: Save game state to Redis (AC: #1)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] After board update and turn alternation, call `IGameRepository.update()`
  - [ ] Save updated game state to Redis
  - [ ] Test: Mock repository and verify update() is called
  - [ ] Test: Verify game state is saved with correct board and currentPlayer

- [ ] Task 6: Handle move message in Gateway (AC: #1, #2)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Inject `GameStateService`
  - [ ] Add message handler for `{ type: 'move', gameCode, row, col }`
  - [ ] Call `GameStateService.makeMove()`
  - [ ] Send `update` message to both players with new board state
  - [ ] Handle errors and send error messages
  - [ ] Test: Integration test with WebSocket client
  - [ ] Test: Verify update message is sent to both players
  - [ ] Test: Verify error message sent on invalid move

## Dev Notes

### Learnings from Previous Story

**From Story 3.2 (Status: drafted)**

- **MoveValidationService**: Service exists with validateMove() method [Source: docs/sprint-artifacts/3-2-move-validation-service.md]
- **ValidationResult**: ValidationResult type exists for validation results [Source: docs/sprint-artifacts/3-2-move-validation-service.md]
- **Use Existing**: Inject and use MoveValidationService in GameStateService

**From Story 4.2 (Status: drafted)**

- **IGameRepository**: Repository interface exists with update() method [Source: docs/sprint-artifacts/4-2-game-state-storage-in-redis.md]
- **Redis Storage**: Game state stored in Redis hash [Source: docs/sprint-artifacts/4-2-game-state-storage-in-redis.md]

### Architecture Patterns and Constraints

- **Application Layer**: Service orchestrates domain logic and infrastructure [Source: docs/architecture.md#Application-Layer]
- **SOLID Principles**: Single responsibility - move processing only [Source: docs/sprint-planning.md#SOLID-Principles]
- **Turn Management**: Server enforces turn order (client validation is UX only) [Source: docs/epics.md#Story-3.3]
- **Code Size**: Service < 150 lines, methods < 15 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- Service: `packages/server/src/application/services/GameStateService.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Repository: `packages/server/src/infrastructure/redis/redis-game.repository.ts`
- Tests: `packages/server/src/application/services/GameStateService.test.ts`
- Depends on: MoveValidationService, IGameRepository, Board, Move

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked repository, 90%+ coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Gateway**: Integration tests with test WebSocket clients [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]

### References

- [Source: docs/epics.md#Story-3.3-Turn-Management-and-Move-Processing]
- [Source: docs/sprint-planning.md#Sprint-4-Application-Layer---Game-Services]
- [Source: docs/architecture.md#Application-Layer]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-20: Story created from Epic 3 breakdown

