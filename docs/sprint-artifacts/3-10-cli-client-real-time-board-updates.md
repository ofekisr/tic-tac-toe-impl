# Story 3.10: CLI Client - Real-Time Board Updates

Status: drafted

## Story

As a player,
I want to see board updates immediately after moves,
So that I can see the current game state in real-time.

## Acceptance Criteria

1. **Given** a client receives `update` message from server
   **When** message includes `board: BoardDTO` (updated board state)
   **Then** client:
   - Clears previous board display (or overwrites)
   - Renders new board using `BoardRenderer.renderBoard()`
   - Displays updated board with current state
   - Shows current player: "Current player: X" or "Current player: O"

2. **Given** client receives `update` message after own move
   **When** move was valid
   **Then** client displays updated board showing own move

3. **Given** client receives `update` message after opponent move
   **When** opponent made a move
   **Then** client:
   - Displays updated board showing opponent's move
   - Updates turn status (now player's turn if currentPlayer matches)

4. **And** board updates happen automatically (no user action required)
5. **And** board display refreshes for every `update`, `win`, or `draw` message (FR22 enhancement)

## Tasks / Subtasks

- [ ] Task 1: Handle update message (AC: #1, #2, #3, #4)
  - [ ] Open `packages/client/src/application/GameClientService.ts` or `packages/client/src/main.ts`
  - [ ] Register handler for `update` message type
  - [ ] Extract `board` and `currentPlayer` from update message
  - [ ] Call `BoardRenderer.displayBoard(board)` to show updated board
  - [ ] Show current player: "Current player: X" or "Current player: O"
  - [ ] Update internal `currentPlayer` state (for turn tracking)
  - [ ] Test: Integration test - verify board updates on update message
  - [ ] Test: Verify board shows correct state after own move
  - [ ] Test: Verify board shows correct state after opponent move
  - [ ] Test: Verify current player is displayed

- [ ] Task 2: Update turn status after board update (AC: #3)
  - [ ] Open `packages/client/src/application/GameClientService.ts`
  - [ ] After board update, check if `currentPlayer === playerSymbol`
  - [ ] If it's now player's turn, enable input (call InputHandler)
  - [ ] If it's not player's turn, show "Waiting for opponent's move..."
  - [ ] Test: Verify turn status updates correctly
  - [ ] Test: Verify input enabled when turn changes to player

- [ ] Task 3: Clear previous board display (AC: #1)
  - [ ] Open `packages/client/src/presentation/cli/BoardRenderer.ts`
  - [ ] Consider clearing console before displaying new board
  - [ ] Or ensure board overwrites previous display
  - [ ] Test: Verify board display is clear and readable

- [ ] Task 4: Handle board updates from win/draw messages (AC: #5)
  - [ ] Open `packages/client/src/application/GameClientService.ts`
  - [ ] Register handler for `win` message: extract `board` and display
  - [ ] Register handler for `draw` message: extract `board` and display
  - [ ] Board display refreshes for win/draw messages (FR22 enhancement)
  - [ ] Test: Verify board displayed on win message
  - [ ] Test: Verify board displayed on draw message

## Dev Notes

### Learnings from Previous Story

**From Story 3.9 (Status: drafted)**

- **Turn State Tracking**: Turn state tracking exists (currentPlayer, playerSymbol) [Source: docs/sprint-artifacts/3-9-cli-client-turn-based-input-control.md]
- **Use Existing**: Update currentPlayer from update messages

**From Story 3.7 (Status: drafted)**

- **BoardRenderer**: BoardRenderer exists with displayBoard() method [Source: docs/sprint-artifacts/3-7-cli-client-initial-board-display.md]
- **Use Existing**: Use BoardRenderer.displayBoard() for board updates

### Architecture Patterns and Constraints

- **Real-Time Updates**: Board refresh happens automatically via WebSocket message handlers [Source: docs/epics.md#Story-3.10]
- **Automatic Refresh**: Board display refreshes for every update, win, or draw message (FR22 enhancement) [Source: docs/epics.md#Story-3.10]
- **Visual Feedback**: Clear visual feedback improves game experience [Source: docs/epics.md#Story-3.10]
- **Code Size**: Handlers < 30 lines each [Source: docs/sprint-planning.md#Sprint-7-CLI-Client-Epic-3---Client-Side]

### Project Structure Notes

- GameClientService: `packages/client/src/application/GameClientService.ts`
- BoardRenderer: `packages/client/src/presentation/cli/BoardRenderer.ts`
- CLI entry: `packages/client/src/main.ts`
- Tests: `packages/client/src/application/GameClientService.test.ts`
- Handles: update, win, draw messages

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Integration Tests**: Test message handling with mock WebSocket messages [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test Scenarios**: Test own move update, opponent move update, win/draw updates

### References

- [Source: docs/epics.md#Story-3.10-CLI-Client---Real-Time-Board-Updates]
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

