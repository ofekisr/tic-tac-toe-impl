# Story 2.5: WebSocket Message Protocol Implementation

Status: drafted

## Story

As a developer,
I want structured JSON message types for WebSocket communication,
So that client and server can exchange game data reliably.

## Acceptance Criteria

1. **Given** shared types package exists (Story 1.3)
   **When** I implement the message protocol
   **Then** `packages/shared/src/types/messages.ts` defines:
   - Client → Server messages: `JoinGameMessage`, `MakeMoveMessage`
   - Server → Client messages: `JoinedMessage`, `UpdateMessage`, `WinMessage`, `DrawMessage`, `ErrorMessage`
   - Type guards: `isClientMessage()`, `isServerMessage()`

2. **And** message types match architecture specification:
   - `JoinGameMessage`: `{ type: 'join', gameCode: string }`
   - `MakeMoveMessage`: `{ type: 'move', gameCode: string, row: number, col: number }`
   - `JoinedMessage`: `{ type: 'joined', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: GameStatus, playerSymbol: PlayerSymbol }`
   - `UpdateMessage`: `{ type: 'update', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: 'playing' }`
   - `WinMessage`: `{ type: 'win', gameCode: string, board: BoardDTO, winner: PlayerSymbol }`
   - `DrawMessage`: `{ type: 'draw', gameCode: string, board: BoardDTO }`
   - `ErrorMessage`: `{ type: 'error', code: ErrorCode, message: string, details?: unknown }`

3. **And** server Gateway validates incoming messages using type guards

## Tasks / Subtasks

- [ ] Task 1: Define client message types (AC: #1, #2)
  - [ ] Open `packages/shared/src/types/messages.ts`
  - [ ] Define `JoinGameMessage` type: `{ type: 'join', gameCode: string }`
  - [ ] Define `MakeMoveMessage` type: `{ type: 'move', gameCode: string, row: number, col: number }`
  - [ ] Create union type: `ClientMessage = JoinGameMessage | MakeMoveMessage`
  - [ ] Test: Verify types compile correctly
  - [ ] Test: Verify type narrowing works with union type

- [ ] Task 2: Define server message types (AC: #1, #2)
  - [ ] Continue in `packages/shared/src/types/messages.ts`
  - [ ] Define `JoinedMessage` type with all required fields
  - [ ] Define `UpdateMessage` type with all required fields
  - [ ] Define `WinMessage` type with all required fields
  - [ ] Define `DrawMessage` type with all required fields
  - [ ] Define `ErrorMessage` type with code, message, and optional details
  - [ ] Create union type: `ServerMessage = JoinedMessage | UpdateMessage | WinMessage | DrawMessage | ErrorMessage`
  - [ ] Test: Verify all message types compile correctly
  - [ ] Test: Verify type narrowing works with union type

- [ ] Task 3: Import required types (AC: #2)
  - [ ] Import `BoardDTO` from `./game.ts` (or define if needed)
  - [ ] Import `PlayerSymbol` from `./game.ts`
  - [ ] Import `GameStatus` from `./game.ts`
  - [ ] Import `ErrorCode` from `./errors.ts`
  - [ ] Test: Verify all imports resolve correctly

- [ ] Task 4: Implement type guards (AC: #1)
  - [ ] Implement `isClientMessage(message: unknown): message is ClientMessage`
  - [ ] Check message has `type` field
  - [ ] Check type is 'join' or 'move'
  - [ ] Validate required fields based on type
  - [ ] Implement `isServerMessage(message: unknown): message is ServerMessage`
  - [ ] Check message has `type` field
  - [ ] Check type is 'joined', 'update', 'win', 'draw', or 'error'
  - [ ] Validate required fields based on type
  - [ ] Test: Verify type guards correctly identify valid messages
  - [ ] Test: Verify type guards reject invalid messages
  - [ ] Test: Verify type guards work with runtime validation

- [ ] Task 5: Export types and guards (AC: #1)
  - [ ] Export all message types from `messages.ts`
  - [ ] Export type guards from `messages.ts`
  - [ ] Update `packages/shared/src/index.ts` to export message types
  - [ ] Test: Verify types can be imported by server and client packages

- [ ] Task 6: Use type guards in Gateway (AC: #3)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Import `isClientMessage` from shared types
  - [ ] Add message validation in message handler
  - [ ] Validate incoming messages using `isClientMessage()`
  - [ ] Send error message if validation fails
  - [ ] Test: Verify Gateway validates messages correctly
  - [ ] Test: Verify invalid messages are rejected

## Dev Notes

### Learnings from Previous Story

**From Story 1.3 (Status: drafted)**

- **Shared Types Package**: Shared types package exists with basic structure [Source: docs/sprint-artifacts/1-3-shared-types-package-setup.md]
- **Type Definitions**: Types directory structure exists: `messages.ts`, `game.ts`, `errors.ts` [Source: docs/sprint-artifacts/1-3-shared-types-package-setup.md]
- **Use Existing**: Build on existing shared types structure, may need to enhance types defined in Story 1.3

**From Story 2.3 (Status: drafted)**

- **Message Types Started**: JoinGameMessage and JoinedMessage types may have been started in Story 2.3 [Source: docs/sprint-artifacts/2-3-game-creation-with-initial-state.md]
- **Use Existing**: Enhance and complete message types, ensure consistency

### Architecture Patterns and Constraints

- **Shared Types**: Shared types ensure protocol consistency between client and server [Source: docs/epics.md#Story-2.5-WebSocket-Message-Protocol-Implementation]
- **Type Guards**: Type guards enable runtime validation of messages [Source: docs/epics.md#Story-2.5-WebSocket-Message-Protocol-Implementation]
- **BoardDTO Format**: BoardDTO (BoardCell[][]) used for JSON serialization [Source: docs/epics.md#Story-2.5-WebSocket-Message-Protocol-Implementation]
- **Error Codes**: Error codes defined in shared types for consistent error handling [Source: docs/epics.md#Story-2.5-WebSocket-Message-Protocol-Implementation]
- **Message Protocol**: JSON-based message format for all communications [Source: docs/prd.md#WebSocket-Message-Protocol]

### Project Structure Notes

- Message types: `packages/shared/src/types/messages.ts`
- Game types: `packages/shared/src/types/game.ts` (for BoardDTO, PlayerSymbol, GameStatus)
- Error types: `packages/shared/src/types/errors.ts` (for ErrorCode)
- Export: `packages/shared/src/index.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Types must be importable by both server and client packages

### Testing Standards

- Shared types: Pure unit tests for type guards (100% coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Test type guards with valid and invalid messages
- Test type narrowing with TypeScript compiler
- Test runtime validation scenarios
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.5-WebSocket-Message-Protocol-Implementation]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/prd.md#WebSocket-Message-Protocol]
- [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-20: Story created from Epic 2 breakdown

