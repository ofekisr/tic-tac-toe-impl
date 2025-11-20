# Story 3.7: CLI Client - Initial Board Display

Status: drafted

## Story

As a player,
I want to see the initial board state when I join a game,
So that I know the game has started and can see the empty board.

## Acceptance Criteria

1. **Given** a client receives `joined` message from server
   **When** the message includes `board: BoardDTO` (empty 3x3 grid)
   **Then** client displays board in ASCII format:
   ```
       0   1   2
   0  [ ] [ ] [ ]
   1  [ ] [ ] [ ]
   2  [ ] [ ] [ ]
   ```

2. **And** board display includes:
   - Row and column labels (0, 1, 2)
   - Empty cells shown as `[ ]`
   - Clear visual separation between cells

3. **And** `packages/client/src/presentation/cli/BoardRenderer.ts` implements:
   - `renderBoard(board: BoardDTO): string` - converts BoardDTO to ASCII string
   - `displayBoard(board: BoardDTO): void` - prints board to console

4. **And** board is displayed immediately upon receiving `joined` message (FR20 enhancement)

## Tasks / Subtasks

- [ ] Task 1: Create BoardRenderer class (AC: #3)
  - [ ] Create `packages/client/src/presentation/cli/BoardRenderer.ts`
  - [ ] Import BoardDTO type from shared package
  - [ ] Implement `renderBoard(board: BoardDTO): string`
  - [ ] Format board with row/column labels
  - [ ] Format empty cells as `[ ]`
  - [ ] Format X cells as `[X]`
  - [ ] Format O cells as `[O]`
  - [ ] Add clear visual separation between cells
  - [ ] Implement `displayBoard(board: BoardDTO): void` - calls renderBoard() and console.log()
  - [ ] Keep renderer < 150 lines
  - [ ] Test: Write `BoardRenderer.test.ts` FIRST with AAA pattern
  - [ ] Test: Verify empty board rendering
  - [ ] Test: Verify board with moves rendering
  - [ ] Test: Verify row/column labels are correct
  - [ ] Test: Verify cell formatting (empty, X, O)

- [ ] Task 2: Handle joined message (AC: #1, #4)
  - [ ] Open `packages/client/src/main.ts` or create `packages/client/src/application/GameClientService.ts`
  - [ ] Register message handler for `joined` message type
  - [ ] Extract `board` from joined message
  - [ ] Call `BoardRenderer.displayBoard(board)`
  - [ ] Display board immediately upon receiving joined message
  - [ ] Test: Verify board is displayed when joined message received
  - [ ] Test: Verify board format matches specification

- [ ] Task 3: Store game state (AC: #1)
  - [ ] Open `packages/client/src/application/GameClientService.ts` (if created)
  - [ ] Store `gameCode`, `playerSymbol`, `currentPlayer` from joined message
  - [ ] Store initial board state
  - [ ] These will be used for turn tracking and board updates
  - [ ] Test: Verify game state is stored correctly

## Dev Notes

### Learnings from Previous Story

**From Story 3.6 (Status: drafted)**

- **WebSocketClient**: WebSocketClient exists with onMessage() handler [Source: docs/sprint-artifacts/3-6-cli-client-websocket-connection.md]
- **Message Handling**: Message handlers can be registered for different message types [Source: docs/sprint-artifacts/3-6-cli-client-websocket-connection.md]
- **Use Existing**: Register handler for 'joined' message type

**From Story 1.3 (Status: drafted)**

- **BoardDTO Type**: BoardDTO type exists in shared package [Source: docs/sprint-artifacts/1-3-shared-types-package-setup.md]
- **Use Existing**: Import BoardDTO type from shared package

### Architecture Patterns and Constraints

- **Presentation Layer**: BoardRenderer in presentation layer [Source: docs/architecture.md#Presentation-Layer]
- **Pure Function**: Board renderer is pure function (no side effects, easy to test) [Source: docs/epics.md#Story-3.7]
- **Initial Display**: Board displayed immediately upon joining (FR20 enhancement) [Source: docs/epics.md#Story-3.7]
- **Code Size**: Renderer < 150 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- BoardRenderer: `packages/client/src/presentation/cli/BoardRenderer.ts`
- GameClientService: `packages/client/src/application/GameClientService.ts` (optional)
- CLI entry: `packages/client/src/main.ts`
- Tests: `packages/client/src/presentation/cli/BoardRenderer.test.ts`
- Uses: BoardDTO from shared package

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Presentation Layer**: Unit tests for renderer, integration tests for message handling [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Pure Function**: Test renderBoard() with different board states

### References

- [Source: docs/epics.md#Story-3.7-CLI-Client---Initial-Board-Display]
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

