# Story 3.11: CLI Client - Win/Draw Notifications

Status: drafted

## Story

As a player,
I want to see clear notifications when the game ends,
So that I know if I won, lost, or drew.

## Acceptance Criteria

1. **Given** a client receives `win` message
   **When** message includes `winner: PlayerSymbol`
   **Then** client:
   - Displays final board state
   - Shows notification: "🎉 Game Over! Winner: X" or "😞 Game Over! Winner: O"
   - Shows "You won!" if `winner === playerSymbol`
   - Shows "You lost!" if `winner !== playerSymbol`
   - Disables further input (game is finished)

2. **Given** a client receives `draw` message
   **When** game ended in a tie
   **Then** client:
   - Displays final board state
   - Shows notification: "🤝 Game Over! It's a draw!"
   - Disables further input

3. **And** notifications are clearly visible and distinct from regular board updates

## Tasks / Subtasks

- [ ] Task 1: Handle win message (AC: #1)
  - [ ] Open `packages/client/src/application/GameClientService.ts` or `packages/client/src/main.ts`
  - [ ] Register handler for `win` message type
  - [ ] Extract `board` and `winner` from win message
  - [ ] Display final board state using `BoardRenderer.displayBoard(board)`
  - [ ] Compare `winner` with `playerSymbol`
  - [ ] If `winner === playerSymbol`: show "🎉 Game Over! Winner: X (or O). You won!"
  - [ ] If `winner !== playerSymbol`: show "😞 Game Over! Winner: X (or O). You lost!"
  - [ ] Disable further input (set game status to 'finished')
  - [ ] Test: Write tests in `GameClientService.test.ts` (extend existing)
  - [ ] Test: Verify win notification shown correctly
  - [ ] Test: Verify "You won!" shown when player wins
  - [ ] Test: Verify "You lost!" shown when player loses
  - [ ] Test: Verify input disabled after win

- [ ] Task 2: Handle draw message (AC: #2)
  - [ ] Open `packages/client/src/application/GameClientService.ts`
  - [ ] Register handler for `draw` message type
  - [ ] Extract `board` from draw message
  - [ ] Display final board state using `BoardRenderer.displayBoard(board)`
  - [ ] Show notification: "🤝 Game Over! It's a draw!"
  - [ ] Disable further input (set game status to 'finished')
  - [ ] Test: Verify draw notification shown correctly
  - [ ] Test: Verify input disabled after draw

- [ ] Task 3: Disable input after game ends (AC: #1, #2)
  - [ ] Open `packages/client/src/application/GameClientService.ts`
  - [ ] Add `gameStatus` state: 'waiting' | 'playing' | 'finished'
  - [ ] Update gameStatus to 'finished' on win/draw
  - [ ] Check gameStatus before accepting input
  - [ ] If gameStatus === 'finished', do not prompt for moves
  - [ ] Test: Verify input disabled when game finished
  - [ ] Test: Verify input enabled when game playing

- [ ] Task 4: Make notifications clearly visible (AC: #3)
  - [ ] Open `packages/client/src/application/GameClientService.ts`
  - [ ] Format win/draw notifications with clear separators
  - [ ] Use emojis or special characters to make notifications distinct
  - [ ] Ensure notifications are displayed prominently
  - [ ] Test: Verify notifications are clearly visible

## Dev Notes

### Learnings from Previous Story

**From Story 3.10 (Status: drafted)**

- **Board Updates**: Board display handling exists for update messages [Source: docs/sprint-artifacts/3-10-cli-client-real-time-board-updates.md]
- **Message Handlers**: Message handler pattern exists for server messages [Source: docs/sprint-artifacts/3-10-cli-client-real-time-board-updates.md]
- **Use Existing**: Extend message handlers for win/draw messages

**From Story 3.7 (Status: drafted)**

- **BoardRenderer**: BoardRenderer exists with displayBoard() method [Source: docs/sprint-artifacts/3-7-cli-client-initial-board-display.md]
- **Use Existing**: Use BoardRenderer.displayBoard() for final board state

### Architecture Patterns and Constraints

- **Game End Feedback**: Win/draw notifications provide clear game end feedback [Source: docs/epics.md#Story-3.11]
- **Input Disabling**: Prevents moves after game ends [Source: docs/epics.md#Story-3.11]
- **Clear Messaging**: Clear messaging improves user experience [Source: docs/epics.md#Story-3.11]
- **Code Size**: Handlers < 30 lines each [Source: docs/sprint-planning.md#Sprint-7-CLI-Client-Epic-3---Client-Side]

### Project Structure Notes

- GameClientService: `packages/client/src/application/GameClientService.ts`
- BoardRenderer: `packages/client/src/presentation/cli/BoardRenderer.ts`
- CLI entry: `packages/client/src/main.ts`
- Tests: `packages/client/src/application/GameClientService.test.ts`
- Handles: win, draw messages

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked dependencies [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test Scenarios**: Test win (player wins), win (player loses), draw, input disabling

### References

- [Source: docs/epics.md#Story-3.11-CLI-Client---Win/Draw-Notifications]
- [Source: docs/sprint-planning.md#Sprint-7-CLI-Client-Epic-3---Client-Side]
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

