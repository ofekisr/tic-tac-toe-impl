# Story 2.6: Message Validation and Error Handling

Status: drafted

## Story

As a player,
I want clear error messages when my requests are invalid,
So that I understand what went wrong and how to fix it.

## Acceptance Criteria

1. **Given** a client sends an invalid message
   **When** the server receives it
   **Then** the server validates:
   - Message is valid JSON
   - Message has required `type` field
   - Message type is recognized (`'join'` or `'move'`)
   - Required fields are present (e.g., `gameCode` for join/move, `row`/`col` for move)

2. **And** if validation fails, server sends error message:
   - `type: 'error'`
   - `code: 'INVALID_MESSAGE'`
   - `message: string` describing the issue (e.g., "Missing required field: gameCode")

3. **Given** a client sends `{ type: 'join', gameCode: 'INVALID' }` for non-existent game
   **When** the server processes it
   **Then** server sends error:
   - `type: 'error'`
   - `code: 'GAME_NOT_FOUND'`
   - `message: "Game code 'INVALID' does not exist"`

## Tasks / Subtasks

- [ ] Task 1: Create MessageValidator service (AC: #1, #2)
  - [ ] Create `packages/server/src/application/services/MessageValidator.ts`
  - [ ] Implement `validateMessage(message: unknown): ValidationResult`
  - [ ] Check message is valid JSON (parse if string)
  - [ ] Check message has `type` field
  - [ ] Check message type is recognized ('join' or 'move')
  - [ ] Validate required fields based on message type:
     - JoinGameMessage: requires `gameCode` field
     - MakeMoveMessage: requires `gameCode`, `row`, `col` fields
  - [ ] Return ValidationResult with success/error details
  - [ ] Test: Test JSON parsing errors
  - [ ] Test: Test missing type field
  - [ ] Test: Test unrecognized message type
  - [ ] Test: Test missing required fields for each message type

- [ ] Task 2: Create ErrorResponse builder (AC: #2, #3)
  - [ ] Create `ErrorResponseBuilder` utility in `packages/server/src/application/utils/ErrorResponseBuilder.ts`
  - [ ] Implement `buildErrorResponse(code: ErrorCode, message: string, details?: unknown): ErrorMessage`
  - [ ] Map common validation errors to ErrorCode enum
  - [ ] Format user-friendly error messages
  - [ ] Test: Verify error response format matches ErrorMessage type
  - [ ] Test: Verify error codes are correct

- [ ] Task 3: Integrate validation in Gateway (AC: #1, #2)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Inject `MessageValidator`
  - [ ] Add validation middleware/handler before message processing
  - [ ] Validate incoming messages using `MessageValidator.validateMessage()`
  - [ ] If validation fails, send error message using `ErrorResponseBuilder`
  - [ ] Test: Integration test with invalid messages
  - [ ] Test: Verify error messages are sent correctly

- [ ] Task 4: Handle game not found error (AC: #3)
  - [ ] Update `JoinGameUseCase` to throw `GameNotFoundException` when game not found
  - [ ] Create `GameNotFoundException` custom exception class
  - [ ] Map exception to ErrorCode `GAME_NOT_FOUND`
  - [ ] Update Gateway to catch exception and send error message
  - [ ] Test: Test game not found scenario
  - [ ] Test: Verify error message format

- [ ] Task 5: Add error codes to shared package (AC: #2, #3)
  - [ ] Open `packages/shared/src/types/errors.ts`
  - [ ] Ensure `ErrorCode` enum includes: `INVALID_MESSAGE`, `GAME_NOT_FOUND`, `GAME_FULL`
  - [ ] Update `ErrorMessage` type if needed
  - [ ] Test: Verify error codes compile correctly

- [ ] Task 6: Add error handling to message handlers (AC: #2, #3)
  - [ ] Wrap all message handlers in Gateway with try-catch
  - [ ] Catch validation errors and send INVALID_MESSAGE error
  - [ ] Catch business logic errors (game not found, etc.) and send appropriate error
  - [ ] Log errors for debugging
  - [ ] Test: Test error handling for all error scenarios
  - [ ] Test: Verify errors don't crash server

## Dev Notes

### Learnings from Previous Story

**From Story 2.5 (Status: drafted)**

- **Message Types**: All message types defined in shared package [Source: docs/sprint-artifacts/2-5-websocket-message-protocol-implementation.md]
- **Type Guards**: `isClientMessage()` and `isServerMessage()` type guards implemented [Source: docs/sprint-artifacts/2-5-websocket-message-protocol-implementation.md]
- **Error Types**: ErrorCode enum and ErrorMessage type defined [Source: docs/sprint-artifacts/2-5-websocket-message-protocol-implementation.md]
- **Use Existing**: Build on type guards, enhance with detailed validation and error handling

### Architecture Patterns and Constraints

- **Message Validation**: Message validation prevents malformed requests from causing errors [Source: docs/epics.md#Story-2.6-Message-Validation-and-Error-Handling]
- **Clear Error Codes**: Clear error codes enable client-side error handling [Source: docs/epics.md#Story-2.6-Message-Validation-and-Error-Handling]
- **User-Friendly Messages**: Error messages should be user-friendly but include details for debugging [Source: docs/epics.md#Story-2.6-Message-Validation-and-Error-Handling]
- **Validation Order**: Validation happens before business logic processing [Source: docs/epics.md#Story-2.6-Message-Validation-and-Error-Handling]
- **Error Handling**: System validates incoming message structure and required fields (FR28) [Source: docs/prd.md#Functional-Requirements]
- **Error Messages**: System sends appropriate error messages for invalid requests (FR29) [Source: docs/prd.md#Functional-Requirements]

### Project Structure Notes

- Validator service: `packages/server/src/application/services/MessageValidator.ts`
- Error builder: `packages/server/src/application/utils/ErrorResponseBuilder.ts`
- Custom exceptions: `packages/server/src/domain/exceptions/` (or similar)
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Error types: `packages/shared/src/types/errors.ts`
- Validation should happen early in request pipeline

### Testing Standards

- Validator service: Unit tests with various invalid message scenarios (90%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Gateway: Integration tests with invalid messages [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Test all validation scenarios (JSON parsing, missing fields, invalid types)
- Test error message format and codes
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.6-Message-Validation-and-Error-Handling]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/prd.md#Functional-Requirements]
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

