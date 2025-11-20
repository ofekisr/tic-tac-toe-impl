# Story 1.3: Shared Types Package Setup

Status: review

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

- [x] Task 1: Configure shared package.json (AC: #1)
  - [x] Create `packages/shared/package.json`
  - [x] Set package name: `"@fusion-tic-tac-toe/shared"`
  - [x] Add TypeScript as dependency
  - [x] Add build script: `"build": "tsc"`
  - [x] Configure Jest test script
  - [x] Test: Verify package.json is valid JSON

- [x] Task 2: Create WebSocket message types (AC: #2)
  - [x] Create `packages/shared/src/types/messages.ts`
  - [x] Define `JoinGameMessage` interface (type: 'join', gameCode: string)
  - [x] Define `MakeMoveMessage` interface (type: 'move', gameCode: string, row: number, col: number)
  - [x] Define `ClientMessage` union type
  - [x] Define `JoinedMessage` interface (type: 'joined', gameCode, board, currentPlayer, status, playerSymbol)
  - [x] Define `UpdateMessage` interface (type: 'update', gameCode, board, currentPlayer, status)
  - [x] Define `WinMessage` interface (type: 'win', gameCode, board, winner)
  - [x] Define `DrawMessage` interface (type: 'draw', gameCode, board)
  - [x] Define `ErrorMessage` interface (type: 'error', code, message, details?)
  - [x] Define `ServerMessage` union type
  - [x] Create type guard functions: `isClientMessage()`, `isServerMessage()`
  - [x] Test: Write unit tests for type guards

- [x] Task 3: Create game state types (AC: #2)
  - [x] Create `packages/shared/src/types/game.ts`
  - [x] Define `BoardCell` type: `'' | 'X' | 'O'`
  - [x] Define `PlayerSymbol` type: `'X' | 'O'`
  - [x] Define `GameStatus` type: `'waiting' | 'playing' | 'finished'`
  - [x] Implement `Board` class with:
    - Constructor (accepts optional BoardCell[][])
    - `getCell(row, col): BoardCell`
    - `setCell(row, col, value): void`
    - `isEmpty(row, col): boolean`
    - `isFull(): boolean`
    - `toArray(): BoardCell[][]`
    - `static fromArray(cells): Board`
    - Validation methods (validateBoard, validatePosition)
  - [x] Define `BoardDTO` type: `BoardCell[][]`
  - [x] Create `BoardMapper` class with `toDTO()` and `fromDTO()` methods
  - [x] Define `BoardPosition` interface (row, col)
  - [x] Define `GameState` interface (gameCode, board, currentPlayer, status, winner, players, createdAt, updatedAt)
  - [x] Implement `Move` class with:
    - Constructor (row, col, player, timestamp)
    - `toPosition(): BoardPosition`
    - `equals(other: Move): boolean`
    - Validation
  - [x] Export constants: `BOARD_SIZE = 3`, `EMPTY_CELL = ''`
  - [x] Test: Write unit tests for Board class (constructor, getCell, setCell, isEmpty, isFull, toArray, fromArray, validation)
  - [x] Test: Write unit tests for Move class (constructor, toPosition, equals, validation)
  - [x] Test: Write unit tests for BoardMapper (toDTO, fromDTO)

- [x] Task 4: Create error types (AC: #2)
  - [x] Create `packages/shared/src/types/errors.ts`
  - [x] Define `ErrorCode` enum with values:
    - INVALID_MESSAGE, GAME_NOT_FOUND, GAME_FULL, INVALID_MOVE, NOT_YOUR_TURN
    - CELL_OCCUPIED, INVALID_POSITION, GAME_ALREADY_FINISHED, CONNECTION_ERROR, SERVER_ERROR
  - [x] Define `GameError` interface (code, message, details?)
  - [x] Test: Write unit tests for ErrorCode enum

- [x] Task 5: Create index exports (AC: #2, #3)
  - [x] Create `packages/shared/src/index.ts`
  - [x] Export all types from `messages.ts`
  - [x] Export all types from `game.ts`
  - [x] Export all types from `errors.ts`
  - [x] Test: Verify other packages can import types via `@fusion-tic-tac-toe/shared`

- [x] Task 6: Verify package exports (AC: #3)
  - [x] Build shared package: `npm run build`
  - [x] Verify dist folder contains compiled JavaScript
  - [x] Test: Create test import in another package to verify types are accessible
  - [x] Test: Verify TypeScript can resolve types correctly

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

- Implemented all type definitions per architecture specification
- Created comprehensive unit tests (52 tests, all passing)
- Board class implemented as value object with validation
- Move class implemented with position and equality checks
- Type guards implemented for runtime message validation
- All types properly exported via index.ts
- Package builds successfully and types are accessible from other packages
- Jest configured and test suite passing

### File List

- packages/shared/package.json (updated with Jest dependencies)
- packages/shared/jest.config.js (created)
- packages/shared/src/index.ts (updated with exports)
- packages/shared/src/types/messages.ts (created)
- packages/shared/src/types/messages.test.ts (created)
- packages/shared/src/types/game.ts (created)
- packages/shared/src/types/game.test.ts (created)
- packages/shared/src/types/errors.ts (created)
- packages/shared/src/types/errors.test.ts (created)

