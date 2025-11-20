# Story 3.5: Draw Condition Detection

Status: drafted

## Story

As a player,
I want the game to detect draws,
So that games end correctly when the board is full with no winner.

## Acceptance Criteria

1. **Given** a board state where all 9 cells are filled (no empty cells)
   **When** no player has three in a row (no winner)
   **Then** draw detection identifies:
   - Board is full: `board.isFull()` returns true
   - No winner: `checkWinCondition()` returns null

2. **And** if draw detected:
   - Game status updated to `'finished'`
   - Winner remains `null`
   - Game state saved to Redis
   - Server sends `draw` message to both players:
     - `type: 'draw'`
     - `gameCode: string`
     - `board: BoardDTO` (final board state)

3. **And** draw detection runs after win check (if no win, check for draw)

## Tasks / Subtasks

- [ ] Task 1: Implement checkDrawCondition method (AC: #1, #3)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] Implement `checkDrawCondition(board: Board): boolean`
  - [ ] Check if board is full using `board.isFull()`
  - [ ] Check if no winner using `checkWinCondition()` returns null
  - [ ] Return true if both conditions met, false otherwise
  - [ ] Keep method < 10 lines (uses Board.isFull())
  - [ ] Test: Write tests in `GameStateService.test.ts` (extend existing)
  - [ ] Test: Verify draw detected when board full and no winner
  - [ ] Test: Verify not draw when board full but winner exists
  - [ ] Test: Verify not draw when board not full

- [ ] Task 2: Integrate draw detection in makeMove (AC: #2, #3)
  - [ ] Open `packages/server/src/application/services/GameStateService.ts`
  - [ ] After win check (if no win), call `checkDrawCondition()`
  - [ ] If draw detected, update game status to 'finished'
  - [ ] Keep winner as null
  - [ ] Save game state to Redis
  - [ ] Test: Verify draw detection runs after win check
  - [ ] Test: Verify game status updated to 'finished' on draw
  - [ ] Test: Verify winner remains null on draw

- [ ] Task 3: Send draw message in Gateway (AC: #2)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] After makeMove() detects draw, send `draw` message to both players
  - [ ] Message format: `{ type: 'draw', gameCode, board }`
  - [ ] Broadcast to both players in the game
  - [ ] Test: Integration test - verify draw message sent
  - [ ] Test: Verify draw message format matches specification
  - [ ] Test: Verify both players receive draw message

- [ ] Task 4: Add DrawMessage type to shared types (AC: #2)
  - [ ] Open `packages/shared/src/types/messages.ts`
  - [ ] Ensure `DrawMessage` type exists: `{ type: 'draw', gameCode: string, board: BoardDTO }`
  - [ ] Export DrawMessage type
  - [ ] Test: Verify DrawMessage type compiles correctly

## Dev Notes

### Learnings from Previous Story

**From Story 3.4 (Status: drafted)**

- **Win Detection**: checkWinCondition() method exists in GameStateService [Source: docs/sprint-artifacts/3-4-win-condition-detection.md]
- **Game End Flow**: Win detection updates game status and sends win message [Source: docs/sprint-artifacts/3-4-win-condition-detection.md]
- **Use Existing**: Use checkWinCondition() to verify no winner before checking draw

**From Story 3.1 (Status: drafted)**

- **Board.isFull()**: Board class has isFull() method [Source: docs/sprint-artifacts/3-1-domain-layer-board-and-move-value-objects.md]
- **Use Existing**: Use board.isFull() to check if board is full

### Architecture Patterns and Constraints

- **Draw Check Order**: Draw check happens after win check (win takes precedence) [Source: docs/epics.md#Story-3.5]
- **Pure Function**: Draw detection uses pure Board methods [Source: docs/epics.md#Story-3.5]
- **Code Size**: Method < 10 lines (uses Board.isFull()) [Source: docs/sprint-planning.md#Sprint-4-Application-Layer---Game-Services]
- **Simultaneous Notification**: Both players receive draw notification simultaneously [Source: docs/epics.md#Story-3.5]

### Project Structure Notes

- Service: `packages/server/src/application/services/GameStateService.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Shared types: `packages/shared/src/types/messages.ts`
- Tests: `packages/server/src/application/services/GameStateService.test.ts`
- Draw detection runs after win check in makeMove()

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked dependencies, 90%+ coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test Scenarios**: Test draw, not draw (winner exists), not draw (board not full)

### References

- [Source: docs/epics.md#Story-3.5-Draw-Condition-Detection]
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

