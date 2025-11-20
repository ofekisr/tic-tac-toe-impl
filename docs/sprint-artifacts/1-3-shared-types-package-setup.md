# Story 1.3: Shared Types Package Setup

Status: drafted

## Story

As a developer,
I want a shared types package with WebSocket message contracts,
So that client and server can implement against the same protocol.

## Acceptance Criteria

1. **Given** the `packages/shared/` directory exists (Story 1.1)
   **When** I set up the shared types package
   **Then** `packages/shared/package.json` includes:
   - Package name: `"@fusion-tic-tac-toe/shared"`
   - TypeScript as dependency
   - Build script: `"build": "tsc"`
   - Test script configured for Jest

2. **And** `packages/shared/src/types/` directory contains:
   - `messages.ts` with WebSocket message type definitions (JoinGameMessage, MakeMoveMessage, JoinedMessage, UpdateMessage, WinMessage, DrawMessage, ErrorMessage)
   - `game.ts` with game state types (Board, BoardDTO, Move, GameState, PlayerSymbol, GameStatus)
   - `errors.ts` with ErrorCode enum and error types
   - `index.ts` exporting all types

3. **And** types are properly exported and can be imported by other packages

## Tasks / Subtasks

- [ ] Task 1: Configure shared package.json (AC: #1)
  - [ ] Create `packages/shared/package.json`
  - [ ] Set package name: `"@fusion-tic-tac-toe/shared"`
  - [ ] Add TypeScript as dependency
  - [ ] Add build script: `"build": "tsc"`
  - [ ] Configure Jest test script
  - [ ] Test: Verify package.json is valid JSON

- [ ] Task 2: Create WebSocket message types (AC: #2)
  - [ ] Create `packages/shared/src/types/messages.ts`
  - [ ] Define `JoinGameMessage` interface (type: 'join', gameCode: string)
  - [ ] Define `MakeMoveMessage` interface (type: 'move', gameCode: string, row: number, col: number)
  - [ ] Define `ClientMessage` union type
  - [ ] Define `JoinedMessage` interface (type: 'joined', gameCode, board, currentPlayer, status, playerSymbol)
  - [ ] Define `UpdateMessage` interface (type: 'update', gameCode, board, currentPlayer, status)
  - [ ] Define `WinMessage` interface (type: 'win', gameCode, board, winner)
  - [ ] Define `DrawMessage` interface (type: 'draw', gameCode, board)
  - [ ] Define `ErrorMessage` interface (type: 'error', code, message, details?)
  - [ ] Define `ServerMessage` union type
  - [ ] Create type guard functions: `isClientMessage()`, `isServerMessage()`
  - [ ] Test: Write unit tests for type guards

- [ ] Task 3: Create game state types (AC: #2)
  - [ ] Create `packages/shared/src/types/game.ts`
  - [ ] Define `BoardCell` type: `'' | 'X' | 'O'`
  - [ ] Define `PlayerSymbol` type: `'X' | 'O'`
  - [ ] Define `GameStatus` type: `'waiting' | 'playing' | 'finished'`
  - [ ] Implement `Board` class with:
    - Constructor (accepts optional BoardCell[][])
    - `getCell(row, col): BoardCell`
    - `setCell(row, col, value): void`
    - `isEmpty(row, col): boolean`
    - `isFull(): boolean`
    - `toArray(): BoardCell[][]`
    - `static fromArray(cells): Board`
    - Validation methods (validateBoard, validatePosition)
  - [ ] Define `BoardDTO` type: `BoardCell[][]`
  - [ ] Create `BoardMapper` class with `toDTO()` and `fromDTO()` methods
  - [ ] Define `BoardPosition` interface (row, col)
  - [ ] Define `GameState` interface (gameCode, board, currentPlayer, status, winner, players, createdAt, updatedAt)
  - [ ] Implement `Move` class with:
    - Constructor (row, col, player, timestamp)
    - `toPosition(): BoardPosition`
    - `equals(other: Move): boolean`
    - Validation
  - [ ] Export constants: `BOARD_SIZE = 3`, `EMPTY_CELL = ''`
  - [ ] Test: Write unit tests for Board class (constructor, getCell, setCell, isEmpty, isFull, toArray, fromArray, validation)
  - [ ] Test: Write unit tests for Move class (constructor, toPosition, equals, validation)
  - [ ] Test: Write unit tests for BoardMapper (toDTO, fromDTO)

- [ ] Task 4: Create error types (AC: #2)
  - [ ] Create `packages/shared/src/types/errors.ts`
  - [ ] Define `ErrorCode` enum with values:
    - INVALID_MESSAGE, GAME_NOT_FOUND, GAME_FULL, INVALID_MOVE, NOT_YOUR_TURN
    - CELL_OCCUPIED, INVALID_POSITION, GAME_ALREADY_FINISHED, CONNECTION_ERROR, SERVER_ERROR
  - [ ] Define `GameError` interface (code, message, details?)
  - [ ] Test: Write unit tests for ErrorCode enum

- [ ] Task 5: Create index exports (AC: #2, #3)
  - [ ] Create `packages/shared/src/index.ts`
  - [ ] Export all types from `messages.ts`
  - [ ] Export all types from `game.ts`
  - [ ] Export all types from `errors.ts`
  - [ ] Test: Verify other packages can import types via `@fusion-tic-tac-toe/shared`

- [ ] Task 6: Verify package exports (AC: #3)
  - [ ] Build shared package: `npm run build`
  - [ ] Verify dist folder contains compiled JavaScript
  - [ ] Test: Create test import in another package to verify types are accessible
  - [ ] Test: Verify TypeScript can resolve types correctly

## Dev Notes

### Architecture Patterns and Constraints

- **Shared Types Package**: Architecture specifies shared types package for contract-first development [Source: docs/architecture.md#Project-Structure]
- **Board Type**: Architecture mandates Board class as value object with BoardDTO for serialization [Source: docs/architecture.md#Data-Architecture]
- **Message Protocol**: Architecture defines WebSocket message types matching protocol specification [Source: docs/architecture.md#API-Contracts]
- **Type Guards**: Architecture recommends type guard functions for runtime type checking [Source: docs/architecture.md#Parallel-Development-Architecture]

### Project Structure Notes

- Shared types package located at `packages/shared/`
- Types organized by domain: `messages.ts`, `game.ts`, `errors.ts`
- All types exported via `index.ts` for clean imports
- Package name follows workspace convention: `@fusion-tic-tac-toe/shared`

### Testing Standards

- Unit tests for Board class: test all methods, validation, edge cases
- Unit tests for Move class: test constructor, validation, equals method
- Unit tests for type guards: test runtime type checking
- Test coverage target: 100% for domain types (pure logic, no dependencies)

### References

- [Source: docs/epics.md#Story-1.3-Shared-Types-Package-Setup]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/architecture.md#API-Contracts]
- [Source: docs/architecture.md#Parallel-Development-Architecture]
- [Source: docs/sprint-planning.md#Development-Principles]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

