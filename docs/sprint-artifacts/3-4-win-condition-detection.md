# Story 3.4: Win Condition Detection

Status: drafted

## Story

As a player,
I want the game to detect when I win,
So that the game ends correctly when I get three in a row.

## Acceptance Criteria

1. **Given** a board state with three X's in a row (horizontally, vertically, or diagonally)
   **When** the server checks win conditions after a move
   **Then** win detection identifies:
   - Horizontal wins: same symbol in any row (e.g., row 0: [X, X, X])
   - Vertical wins: same symbol in any column (e.g., col 1: [X, X, X])
   - Diagonal wins: same symbol in main diagonal (0,0 → 2,2) or anti-diagonal (0,2 → 2,0)

2. **And** if win detected:
   - Game status updated to `'finished'`
   - Winner set to winning player symbol ('X' or 'O')
   - Game state saved to Redis
   - Server sends `win` message to both players:
     - `type: 'win'`
     - `gameCode: string`
     - `board: BoardDTO` (final board state)
     - `winner: PlayerSymbol`

3. **And** win detection is implemented in `GameStateService.checkWinCondition(board: Board): PlayerSymbol | null`

## Tasks / Subtasks

- [ ] Task 1: Implement checkWinCondition method (AC: #1, #3)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] Implement `checkWinCondition(board: Board): PlayerSymbol | null`
  - [ ] Implement `checkRow(board: Board, row: number): PlayerSymbol | null` private method
  - [ ] Implement `checkColumn(board: Board, col: number): PlayerSymbol | null` private method
  - [ ] Implement `checkDiagonals(board: Board): PlayerSymbol | null` private method
  - [ ] Check all 3 rows for horizontal wins
  - [ ] Check all 3 columns for vertical wins
  - [ ] Check main diagonal (0,0 → 2,2) for diagonal win
  - [ ] Check anti-diagonal (0,2 → 2,0) for diagonal win
  - [ ] Return winning player symbol or null if no win
  - [ ] Keep method < 30 lines (extract helpers if needed)
  - [ ] Test: Write tests in `GameStateService.test.ts` (extend existing)
  - [ ] Test: Verify horizontal wins (all 3 rows)
  - [ ] Test: Verify vertical wins (all 3 columns)
  - [ ] Test: Verify diagonal wins (main + anti-diagonal)
  - [ ] Test: Verify no win scenarios return null

- [ ] Task 2: Integrate win detection in makeMove (AC: #2)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] After board update, call `checkWinCondition()`
  - [ ] If win detected, update game status to 'finished'
  - [ ] Set winner to winning player symbol
  - [ ] Save game state to Redis
  - [ ] Test: Verify win detection runs after every move
  - [ ] Test: Verify game status updated to 'finished' on win
  - [ ] Test: Verify winner is set correctly

- [ ] Task 3: Send win message in Gateway (AC: #2)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] After makeMove() detects win, send `win` message to both players
  - [ ] Message format: `{ type: 'win', gameCode, board, winner }`
  - [ ] Broadcast to both players in the game
  - [ ] Test: Integration test - verify win message sent
  - [ ] Test: Verify win message format matches specification
  - [ ] Test: Verify both players receive win message

- [ ] Task 4: Add WinMessage type to shared types (AC: #2)
  - [ ] Open `packages/shared/src/types/messages.ts`
  - [ ] Ensure `WinMessage` type exists: `{ type: 'win', gameCode: string, board: BoardDTO, winner: PlayerSymbol }`
  - [ ] Export WinMessage type
  - [ ] Test: Verify WinMessage type compiles correctly

## Dev Notes

### Learnings from Previous Story

**From Story 3.3 (Status: drafted)**

- **GameStateService**: Service exists with makeMove() method [Source: docs/sprint-artifacts/3-3-turn-management-and-move-processing.md]
- **Board Updates**: Board is updated after moves using Board.setCell() [Source: docs/sprint-artifacts/3-3-turn-management-and-move-processing.md]
- **Use Existing**: Extend GameStateService with win detection logic

**From Story 3.1 (Status: drafted)**

- **Board Value Object**: Board class exists with getCell() method [Source: docs/sprint-artifacts/3-1-domain-layer-board-and-move-value-objects.md]
- **Use Existing**: Use Board.getCell() to check cell values for win detection

### Architecture Patterns and Constraints

- **Pure Function**: Win detection is pure function (no side effects) [Source: docs/epics.md#Story-3.4]
- **Win Detection**: Runs after every valid move [Source: docs/epics.md#Story-3.4]
- **8 Combinations**: Checks all 8 possible winning combinations (3 rows + 3 cols + 2 diagonals) [Source: docs/epics.md#Story-3.4]
- **Code Size**: Method < 30 lines, extract helpers if needed [Source: docs/sprint-planning.md#Sprint-4-Application-Layer---Game-Services]

### Project Structure Notes

- Service: `packages/server/src/application/services/GameStateService.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Shared types: `packages/shared/src/types/messages.ts`
- Tests: `packages/server/src/application/services/GameStateService.test.ts`
- Win detection runs after board update in makeMove()

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked dependencies, 90%+ coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test Coverage**: Test all 8 winning combinations

### References

- [Source: docs/epics.md#Story-3.4-Win-Condition-Detection]
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

