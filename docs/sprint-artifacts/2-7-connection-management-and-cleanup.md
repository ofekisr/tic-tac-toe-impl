# Story 2.7: Connection Management and Cleanup

Status: drafted

## Story

As a developer,
I want proper WebSocket connection lifecycle management,
So that disconnected clients don't leave orphaned game state.

## Acceptance Criteria

1. **Given** a client is connected and joined to a game
   **When** the client disconnects (WebSocket close event)
   **Then** the server:
   - Detects disconnection in `handleDisconnect()` method
   - Removes connection from game's player tracking (if applicable)
   - Updates game state if needed (e.g., mark player as disconnected)
   - Logs disconnection event for debugging

2. **And** if both players disconnect:
   - Game state remains in Redis (with TTL)
   - Game can be rejoined if players reconnect (optional for MVP)

3. **And** connection tracking maps WebSocket connections to:
   - Game codes they're participating in
   - Player symbols (X or O) assigned to them

## Tasks / Subtasks

- [ ] Task 1: Enhance ConnectionManager service (AC: #3)
  - [ ] Open `packages/server/src/application/services/ConnectionManager.ts` (created in Story 2.4)
  - [ ] Add method: `removeConnection(connectionId: string): void`
  - [ ] Add method: `getConnectionsByGameCode(gameCode: string): string[]` (returns connection IDs)
  - [ ] Add method: `removeConnectionFromGame(connectionId: string, gameCode: string): void`
  - [ ] Maintain bidirectional mapping: connectionId → gameCode, gameCode → connectionIds[]
  - [ ] Test: Verify connection removal works correctly
  - [ ] Test: Verify can retrieve connections by game code

- [ ] Task 2: Implement disconnection handler in Gateway (AC: #1)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Enhance `handleDisconnect()` method (already exists from Story 2.1)
  - [ ] Inject `ConnectionManager`
  - [ ] Get game code for disconnected connection
  - [ ] Remove connection from ConnectionManager
  - [ ] If game exists, update game state (mark player as disconnected)
  - [ ] Log disconnection event with connection ID and game code
  - [ ] Test: Integration test with WebSocket client disconnection
  - [ ] Test: Verify connection is removed from tracking

- [ ] Task 3: Update game state on disconnection (AC: #1)
  - [ ] Create `UpdateGameOnDisconnectionUseCase` in `packages/server/src/application/use-cases/UpdateGameOnDisconnectionUseCase.ts`
  - [ ] Inject `IGameRepository` and `ConnectionManager`
  - [ ] Implement `execute(connectionId: string): Promise<void>`
  - [ ] Get game code from ConnectionManager
  - [ ] Load game from repository
  - [ ] Remove connection ID from players object (set to undefined)
  - [ ] Update game state in repository
  - [ ] Test: Mock repository and verify game state update
  - [ ] Test: Verify player is removed from players object

- [ ] Task 4: Handle both players disconnected (AC: #2)
  - [ ] Update `UpdateGameOnDisconnectionUseCase`
  - [ ] Check if both players are disconnected (both undefined in players object)
  - [ ] If both disconnected, game state remains in Redis (TTL handles cleanup)
  - [ ] Optionally: Mark game status as 'abandoned' (optional for MVP)
  - [ ] Test: Test scenario where both players disconnect
  - [ ] Test: Verify game state remains in Redis

- [ ] Task 5: Add reconnection support (optional for MVP) (AC: #2)
  - [ ] If reconnection supported: Allow player to rejoin game using same game code
  - [ ] Validate player can rejoin if game status allows
  - [ ] Restore player assignment (X or O) based on game state
  - [ ] Test: Test reconnection scenario (if implemented)

- [ ] Task 6: Enhance logging (AC: #1)
  - [ ] Add structured logging for connection events
  - [ ] Log connection ID, game code, player symbol on disconnect
  - [ ] Log game state after disconnection
  - [ ] Use appropriate log levels (info for normal, warn for errors)
  - [ ] Test: Verify logs are generated correctly

## Dev Notes

### Learnings from Previous Story

**From Story 2.1 (Status: drafted)**

- **Disconnect Handler**: `handleDisconnect()` method exists in GameGateway [Source: docs/sprint-artifacts/2-1-websocket-server-setup-with-nestjs-gateway.md]
- **Connection Lifecycle**: Gateway handles connection lifecycle via `OnGatewayDisconnect` interface [Source: docs/sprint-artifacts/2-1-websocket-server-setup-with-nestjs-gateway.md]
- **Use Existing**: Enhance existing disconnect handler with cleanup logic

**From Story 2.4 (Status: drafted)**

- **ConnectionManager**: ConnectionManager service exists for tracking connections [Source: docs/sprint-artifacts/2-4-game-joining-with-validation.md]
- **Connection Tracking**: Connection tracking maps connections to game codes and player symbols [Source: docs/sprint-artifacts/2-4-game-joining-with-validation.md]
- **Use Existing**: Enhance ConnectionManager with disconnection cleanup methods

### Architecture Patterns and Constraints

- **Connection Cleanup**: Connection cleanup prevents memory leaks [Source: docs/epics.md#Story-2.7-Connection-Management-and-Cleanup]
- **Disconnection Handling**: Disconnection handling needed for graceful degradation [Source: docs/epics.md#Story-2.7-Connection-Management-and-Cleanup]
- **Connection Tracking**: Connection tracking enables message routing to specific clients [Source: docs/epics.md#Story-2.7-Connection-Management-and-Cleanup]
- **Redis TTL**: Redis TTL handles abandoned games automatically [Source: docs/epics.md#Story-2.7-Connection-Management-and-Cleanup]
- **Error Handling**: System provides error handling framework for connection failures (FR30) [Source: docs/prd.md#Functional-Requirements]

### Project Structure Notes

- Connection manager: `packages/server/src/application/services/ConnectionManager.ts`
- Use case: `packages/server/src/application/use-cases/UpdateGameOnDisconnectionUseCase.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Repository: `packages/server/src/infrastructure/redis/redis-game.repository.ts`
- Connection cleanup should happen synchronously on disconnect

### Testing Standards

- Connection manager: Unit tests for connection tracking and removal (90%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Use case: Unit tests with mocked repository (90%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Gateway: Integration tests with WebSocket client disconnection [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Test single player disconnect, both players disconnect scenarios
- Test connection cleanup and game state updates
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.7-Connection-Management-and-Cleanup]
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

