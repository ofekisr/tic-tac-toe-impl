# Story 3.8: CLI Client - User Input Handling with Validation

Status: drafted

## Story

As a player,
I want to input moves with validation and retry on errors,
So that I can make moves easily even if I make input mistakes.

## Acceptance Criteria

1. **Given** it's the player's turn
   **When** client prompts for move input
   **Then** client:
   - Shows prompt: "Your turn (X): Enter move (row col): "
   - Accepts input formats: "1 1", "1,1", "1, 1" (flexible parsing)
   - Validates input before sending:
     - Both row and col provided
     - Values are numbers (0, 1, or 2)
     - Values are within bounds (0-2)

2. **And** if input is invalid:
   - Shows clear error: "Invalid input. Please enter row and column (0-2), e.g., '1 1'"
   - Prompts again (allows retry)
   - Does NOT send message to server

3. **And** if input is valid:
   - Converts to numbers: "1 1" → row: 1, col: 1
   - Sends `{ type: 'move', gameCode: string, row: 1, col: 1 }` to server

4. **And** `packages/client/src/presentation/cli/InputHandler.ts` implements:
   - `parseInput(input: string): { row: number, col: number } | null`
   - `validateInput(row: number, col: number): boolean`
   - `promptForMove(): Promise<{ row: number, col: number }>`

## Tasks / Subtasks

- [ ] Task 1: Create InputHandler class (AC: #4)
  - [ ] Create `packages/client/src/presentation/cli/InputHandler.ts`
  - [ ] Import readline or similar for user input
  - [ ] Implement `parseInput(input: string): { row: number, col: number } | null`
  - [ ] Support formats: "1 1", "1,1", "1, 1" (flexible parsing)
  - [ ] Return null if parsing fails
  - [ ] Implement `validateInput(row: number, col: number): boolean`
  - [ ] Check both row and col are numbers
  - [ ] Check values are within bounds (0-2)
  - [ ] Implement `promptForMove(): Promise<{ row: number, col: number }>`
  - [ ] Show prompt: "Your turn (X): Enter move (row col): "
  - [ ] Read user input
  - [ ] Parse and validate input
  - [ ] Retry on invalid input with error message
  - [ ] Return valid { row, col } object
  - [ ] Keep handler < 150 lines
  - [ ] Test: Write `InputHandler.test.ts` FIRST with AAA pattern
  - [ ] Test: Verify valid input parsing ("1 1", "1,1", "1, 1")
  - [ ] Test: Verify invalid input (out of bounds, non-numeric)
  - [ ] Test: Verify retry on error
  - [ ] Test: Verify error messages are clear

- [ ] Task 2: Integrate InputHandler with game flow (AC: #1, #2, #3)
  - [ ] Open `packages/client/src/main.ts` or `packages/client/src/application/GameClientService.ts`
  - [ ] Create InputHandler instance
  - [ ] When it's player's turn, call `promptForMove()`
  - [ ] Get valid { row, col } from InputHandler
  - [ ] Send move message: `{ type: 'move', gameCode, row, col }`
  - [ ] Test: Verify move message is sent with correct format
  - [ ] Test: Verify invalid input doesn't send message

- [ ] Task 3: Add player symbol to prompt (AC: #1)
  - [ ] Open `packages/client/src/presentation/cli/InputHandler.ts`
  - [ ] Update `promptForMove()` to accept playerSymbol parameter
  - [ ] Show prompt: "Your turn (X): Enter move (row col): " or "Your turn (O): ..."
  - [ ] Test: Verify prompt shows correct player symbol

## Dev Notes

### Learnings from Previous Story

**From Story 3.7 (Status: drafted)**

- **Game State**: Game state stored (gameCode, playerSymbol) [Source: docs/sprint-artifacts/3-7-cli-client-initial-board-display.md]
- **Use Existing**: Use stored gameCode and playerSymbol for move messages

**From Story 3.6 (Status: drafted)**

- **WebSocketClient**: WebSocketClient exists with send() method [Source: docs/sprint-artifacts/3-6-cli-client-websocket-connection.md]
- **Use Existing**: Use WebSocketClient.send() to send move messages

### Architecture Patterns and Constraints

- **Presentation Layer**: InputHandler in presentation layer [Source: docs/architecture.md#Presentation-Layer]
- **Input Tolerance**: Retry on error provides tolerance for mistakes (FR21 enhancement) [Source: docs/epics.md#Story-3.8]
- **Client-Side Validation**: Prevents invalid moves from being sent [Source: docs/epics.md#Story-3.8]
- **Code Size**: Handler < 150 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- InputHandler: `packages/client/src/presentation/cli/InputHandler.ts`
- GameClientService: `packages/client/src/application/GameClientService.ts` (optional)
- CLI entry: `packages/client/src/main.ts`
- Tests: `packages/client/src/presentation/cli/InputHandler.test.ts`
- Uses: readline or similar for user input

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Presentation Layer**: Unit tests for input parsing/validation [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Mock Input**: Mock readline or input source for testing

### References

- [Source: docs/epics.md#Story-3.8-CLI-Client---User-Input-Handling-with-Validation]
- [Source: docs/sprint-planning.md#Sprint-7-CLI-Client-Epic-3---Client-Side]
- [Source: docs/architecture.md#Presentation-Layer]

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

