# Story 3.9: CLI Client - Turn-Based Input Control

Status: drafted

## Story

As a player,
I want input to be disabled when it's not my turn,
So that I don't accidentally try to move out of turn.

## Acceptance Criteria

1. **Given** it's NOT the player's turn (currentPlayer ≠ playerSymbol)
   **When** user tries to input a move
   **Then** client:
   - Ignores user input (does not prompt for move)
   - Shows status message: "Waiting for opponent's move..."
   - Does NOT send move message to server

2. **Given** it IS the player's turn (currentPlayer === playerSymbol)
   **When** user inputs a move
   **Then** client:
   - Accepts input and prompts for move
   - Validates and sends move message

3. **And** turn state is tracked in client:
   - Stores `currentPlayer` from server messages
   - Stores `playerSymbol` from `joined` message
   - Compares before accepting input: `if (currentPlayer === playerSymbol) { acceptInput() }`

## Tasks / Subtasks

- [ ] Task 1: Track turn state (AC: #3)
  - [ ] Open `packages/client/src/application/GameClientService.ts` or `packages/client/src/main.ts`
  - [ ] Store `playerSymbol` from `joined` message
  - [ ] Store `currentPlayer` from server messages (`joined`, `update`, `win`, `draw`)
  - [ ] Update `currentPlayer` when receiving server messages
  - [ ] Test: Verify turn state is stored correctly
  - [ ] Test: Verify currentPlayer updates from server messages

- [ ] Task 2: Implement turn-based input control (AC: #1, #2)
  - [ ] Open `packages/client/src/application/GameClientService.ts` or `packages/client/src/main.ts`
  - [ ] Before prompting for input, check: `if (currentPlayer === playerSymbol)`
  - [ ] If it's player's turn: call `InputHandler.promptForMove()`
  - [ ] If it's NOT player's turn: show "Waiting for opponent's move..." and skip input
  - [ ] Test: Write `GameClientService.test.ts` FIRST with AAA pattern
  - [ ] Test: Verify input blocked when not turn
  - [ ] Test: Verify input accepted when turn
  - [ ] Test: Verify status message shown when waiting

- [ ] Task 3: Update turn state from server messages (AC: #3)
  - [ ] Open `packages/client/src/application/GameClientService.ts` or `packages/client/src/main.ts`
  - [ ] Register handler for `joined` message: extract `currentPlayer`
  - [ ] Register handler for `update` message: extract `currentPlayer`
  - [ ] Register handler for `win` message: game finished, disable input
  - [ ] Register handler for `draw` message: game finished, disable input
  - [ ] Update internal `currentPlayer` state
  - [ ] Test: Verify turn state updates from all message types
  - [ ] Test: Verify input disabled after game ends

## Dev Notes

### Learnings from Previous Story

**From Story 3.8 (Status: drafted)**

- **InputHandler**: InputHandler exists with promptForMove() method [Source: docs/sprint-artifacts/3-8-cli-client-user-input-handling-with-validation.md]
- **Use Existing**: Use InputHandler only when it's player's turn

**From Story 3.7 (Status: drafted)**

- **Game State**: playerSymbol stored from joined message [Source: docs/sprint-artifacts/3-7-cli-client-initial-board-display.md]
- **Use Existing**: Use stored playerSymbol for turn comparison

### Architecture Patterns and Constraints

- **Client-Side Validation**: Prevents unnecessary server requests (FR6 enhancement) [Source: docs/epics.md#Story-3.9]
- **Input Blocking**: Provides clear UX feedback [Source: docs/epics.md#Story-3.9]
- **Turn State Tracking**: Enables reactive UI behavior [Source: docs/epics.md#Story-3.9]
- **Server Validation**: Server still validates (client validation is UX only) [Source: docs/epics.md#Story-3.9]
- **Code Size**: Service < 150 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- GameClientService: `packages/client/src/application/GameClientService.ts`
- CLI entry: `packages/client/src/main.ts`
- Tests: `packages/client/src/application/GameClientService.test.ts`
- Tracks: playerSymbol, currentPlayer, game status

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Application Layer**: Unit tests with mocked dependencies [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test Scenarios**: Test turn matching, turn not matching, game finished

### References

- [Source: docs/epics.md#Story-3.9-CLI-Client---Turn-Based-Input-Control]
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

