# Story 3.2: Move Validation Service

Status: drafted

## Story

As a player,
I want my moves validated before they're accepted,
So that invalid moves are rejected with clear reasons.

## Acceptance Criteria

1. **Given** a move request `{ type: 'move', gameCode: 'ABC123', row: 1, col: 1 }`
   **When** the server validates the move
   **Then** validation checks:
   - Game exists and is in `'playing'` status
   - It's the requesting player's turn (currentPlayer matches playerSymbol)
   - Cell is empty (not occupied by X or O)
   - Position is valid (row and col are 0, 1, or 2)
   - Game is not finished (status is not `'finished'`)

2. **And** if any validation fails, server sends error:
   - `type: 'error'`
   - `code: 'NOT_YOUR_TURN'` | `'CELL_OCCUPIED'` | `'INVALID_POSITION'` | `'GAME_ALREADY_FINISHED'`
   - `message: string` describing the issue

3. **And** validation is implemented in `MoveValidationService` with:
   - `validateMove(game: Game, move: Move, playerSymbol: PlayerSymbol): ValidationResult`
   - Returns success or specific error code

## Tasks / Subtasks

- [ ] Task 1: Create ValidationResult type (AC: #3)
  - [ ] Open `packages/server/src/domain/value-objects/ValidationResult.ts`
  - [ ] Define `ValidationResult` type: `{ isValid: boolean, errorCode?: ErrorCode }`
  - [ ] Export ValidationResult type
  - [ ] Test: Verify ValidationResult type works correctly

- [ ] Task 2: Create MoveValidationService (AC: #1, #2, #3)
  - [ ] Create `packages/server/src/application/services/MoveValidationService.ts`
  - [ ] Implement `validateMove(game: Game, move: Move, playerSymbol: PlayerSymbol): ValidationResult`
  - [ ] Implement `validateGameStatus(game: Game): ValidationResult` private method
  - [ ] Implement `validateTurn(game: Game, playerSymbol: PlayerSymbol): ValidationResult` private method
  - [ ] Implement `validateCell(game: Game, move: Move): ValidationResult` private method
  - [ ] Implement `validatePosition(move: Move): ValidationResult` private method
  - [ ] Keep service < 150 lines, methods < 15 lines each
  - [ ] Test: Write `MoveValidationService.test.ts` FIRST with AAA pattern
  - [ ] Test: Verify valid moves pass validation
  - [ ] Test: Verify wrong turn fails with 'NOT_YOUR_TURN'
  - [ ] Test: Verify occupied cell fails with 'CELL_OCCUPIED'
  - [ ] Test: Verify out of bounds fails with 'INVALID_POSITION'
  - [ ] Test: Verify finished game fails with 'GAME_ALREADY_FINISHED'
  - [ ] Test: Verify non-playing game fails validation

- [ ] Task 3: Add error codes to shared types (AC: #2)
  - [ ] Open `packages/shared/src/types/errors.ts`
  - [ ] Add error codes: 'NOT_YOUR_TURN', 'CELL_OCCUPIED', 'INVALID_POSITION', 'GAME_ALREADY_FINISHED'
  - [ ] Export ErrorCode enum
  - [ ] Test: Verify error codes are exported correctly

- [ ] Task 4: Create Game entity interface (AC: #1)
  - [ ] Open `packages/server/src/domain/entities/Game.ts` (if not exists)
  - [ ] Ensure Game entity has: `status`, `currentPlayer`, `board`, `players` properties
  - [ ] Ensure Game entity can be used by MoveValidationService
  - [ ] Test: Verify Game entity structure matches validation needs

## Dev Notes

### Learnings from Previous Story

**From Story 3.1 (Status: drafted)**

- **Board Value Object**: Board class exists with getCell, setCell, isEmpty methods [Source: docs/sprint-artifacts/3-1-domain-layer-board-and-move-value-objects.md]
- **Move Value Object**: Move class exists with row, col, player properties [Source: docs/sprint-artifacts/3-1-domain-layer-board-and-move-value-objects.md]
- **Use Existing**: Use Board.isEmpty() and Move validation in validation service

**From Story 2.4 (Status: drafted)**

- **Game Entity**: Game entity exists with status, currentPlayer, board properties [Source: docs/sprint-artifacts/2-4-game-joining-with-validation.md]
- **Game Status**: Game status can be 'waiting', 'playing', 'finished' [Source: docs/sprint-artifacts/2-4-game-joining-with-validation.md]

### Architecture Patterns and Constraints

- **Application Layer**: Service in application layer depends only on domain objects [Source: docs/architecture.md#Application-Layer]
- **SOLID Principles**: Single responsibility - move validation only [Source: docs/sprint-planning.md#SOLID-Principles]
- **Pure Business Logic**: No infrastructure dependencies (pure domain logic) [Source: docs/epics.md#Story-3.2]
- **Code Size**: Service < 150 lines, methods < 15 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- Service: `packages/server/src/application/services/MoveValidationService.ts`
- ValidationResult: `packages/server/src/domain/value-objects/ValidationResult.ts`
- Error codes: `packages/shared/src/types/errors.ts`
- Tests: `packages/server/src/application/services/MoveValidationService.test.ts`
- Depends on: Board, Move (domain), Game (domain)

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked Game entity, 90%+ coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Mock Game**: Create mock Game objects for testing different scenarios

### References

- [Source: docs/epics.md#Story-3.2-Move-Validation-Service]
- [Source: docs/sprint-planning.md#Sprint-2-Domain-Interfaces--Application-Layer-Foundation]
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

