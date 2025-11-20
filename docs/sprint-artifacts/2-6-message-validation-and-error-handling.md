# Story 2.6: Message Validation and Error Handling

Status: review

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

- [x] Task 1: Create MessageValidator service (AC: #1, #2)
  - [x] Create `packages/server/src/application/services/MessageValidator.ts`
  - [x] Implement `validateMessage(message: unknown): ValidationResult`
  - [x] Check message is valid JSON (parse if string)
  - [x] Check message has `type` field
  - [x] Check message type is recognized ('join' or 'move')
  - [x] Validate required fields based on message type:
     - JoinGameMessage: requires `gameCode` field
     - MakeMoveMessage: requires `gameCode`, `row`, `col` fields
  - [x] Return ValidationResult with success/error details
  - [x] Test: Test JSON parsing errors
  - [x] Test: Test missing type field
  - [x] Test: Test unrecognized message type
  - [x] Test: Test missing required fields for each message type

- [x] Task 2: Create ErrorResponse builder (AC: #2, #3)
  - [x] Create `ErrorResponseBuilder` utility in `packages/server/src/application/utils/ErrorResponseBuilder.ts`
  - [x] Implement `buildErrorResponse(code: ErrorCode, message: string, details?: unknown): ErrorMessage`
  - [x] Map common validation errors to ErrorCode enum
  - [x] Format user-friendly error messages
  - [x] Test: Verify error response format matches ErrorMessage type
  - [x] Test: Verify error codes are correct

- [x] Task 3: Integrate validation in Gateway (AC: #1, #2)
  - [x] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [x] Inject `MessageValidator`
  - [x] Add validation middleware/handler before message processing
  - [x] Validate incoming messages using `MessageValidator.validateMessage()`
  - [x] If validation fails, send error message using `ErrorResponseBuilder`
  - [x] Test: Integration test with invalid messages
  - [x] Test: Verify error messages are sent correctly

- [x] Task 4: Handle game not found error (AC: #3)
  - [x] Create `GameNotFoundException` custom exception class
  - [x] Map exception to ErrorCode `GAME_NOT_FOUND`
  - [x] Update Gateway to catch exception and send error message
  - [x] Test: Test game not found scenario
  - [x] Test: Verify error message format

- [x] Task 5: Add error codes to shared package (AC: #2, #3)
  - [x] Open `packages/shared/src/types/errors.ts`
  - [x] Ensure `ErrorCode` enum includes: `INVALID_MESSAGE`, `GAME_NOT_FOUND`, `GAME_FULL`
  - [x] Verify `ErrorMessage` type is correct
  - [x] Test: Verify error codes compile correctly

- [x] Task 6: Add error handling to message handlers (AC: #2, #3)
  - [x] Wrap all message handlers in Gateway with try-catch
  - [x] Catch validation errors and send INVALID_MESSAGE error
  - [x] Catch business logic errors (game not found, etc.) and send appropriate error
  - [x] Log errors for debugging
  - [x] Test: Test error handling for all error scenarios
  - [x] Test: Verify errors don't crash server

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

**Implementation Summary:**
- Created MessageValidator service with comprehensive validation (JSON parsing, type checking, field validation)
- Created ErrorResponseBuilder utility for standardized error message creation
- Created GameNotFoundException custom exception for game not found scenarios
- Integrated MessageValidator into GameGateway with comprehensive error handling
- All error codes verified in shared package (INVALID_MESSAGE, GAME_NOT_FOUND, GAME_FULL already exist)
- Error handling wraps all message handlers with try-catch blocks
- All tests passing (89 tests total, 100% pass rate)
- Validation provides detailed error messages for better client debugging

### File List

- `packages/server/src/application/services/MessageValidator.ts` - Message validation service
- `packages/server/src/application/services/MessageValidator.spec.ts` - Validator tests
- `packages/server/src/application/utils/ErrorResponseBuilder.ts` - Error response builder utility
- `packages/server/src/application/utils/ErrorResponseBuilder.spec.ts` - Error builder tests
- `packages/server/src/domain/exceptions/GameNotFoundException.ts` - Custom exception for game not found
- `packages/server/src/domain/exceptions/GameNotFoundException.spec.ts` - Exception tests
- `packages/server/src/presentation/game/game.gateway.ts` - Updated with validation and error handling
- `packages/server/src/presentation/game/game.gateway.spec.ts` - Updated Gateway tests
- `packages/server/src/presentation/game/game.module.ts` - Added MessageValidator provider

## Change Log

- 2025-11-20: Story created from Epic 2 breakdown
- 2025-01-27: Story implementation complete - All validation and error handling implemented. MessageValidator provides detailed validation, ErrorResponseBuilder standardizes error messages, GameNotFoundException handles game not found scenarios. All tests passing (89 tests, 100% pass rate).

