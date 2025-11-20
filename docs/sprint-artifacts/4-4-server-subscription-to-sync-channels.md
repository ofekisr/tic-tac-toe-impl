# Story 4.4: Server Subscription to Sync Channels

Status: done

## Story

As a developer,
I want servers to subscribe to Redis sync channels,
So that they receive game state updates from other servers.

## Acceptance Criteria

1. **Given** a server starts up
   **When** Redis connection is established
   **Then** server subscribes to Redis pub/sub pattern:
   - Pattern: `game:sync:*` (all game sync channels)
   - Or: subscribe to specific channels as games are created/joined

2. **And** when sync message is received:
   - Server parses JSON message
   - Server reads updated game state from Redis (`game:{gameCode}`)
   - Server updates local cache (if using cache)
   - Server broadcasts update to connected clients for that game

3. **And** `RedisService` implements:
   - `subscribe(channel: string, callback: (message: string) => void): Promise<void>`
   - `unsubscribe(channel: string): Promise<void>`
   - Message handler processes sync messages

4. **And** subscription handles:
   - Multiple concurrent games
   - Channel cleanup when games end
   - Error handling for subscription failures

## Tasks / Subtasks

- [ ] Task 1: Extend RedisService subscription methods (AC: #3)
  - [ ] Verify `subscribe(channel: string, callback: (message: string) => void): Promise<void>` exists
  - [ ] Implement `unsubscribe(channel: string): Promise<void>` if not exists
  - [ ] Implement pattern subscription support (`game:sync:*`)
  - [ ] Test: Write unit tests with mocked ioredis

- [ ] Task 2: Create SyncGameStateUseCase (AC: #2)
  - [ ] Create `packages/server/src/application/use-cases/SyncGameStateUseCase.ts`
  - [ ] Implement `handleSyncMessage(message: string): Promise<void>`
  - [ ] Parse JSON sync message
  - [ ] Read game state from Redis using gameCode
  - [ ] Update local cache (if applicable)
  - [ ] Test: Write unit tests with mocked dependencies

- [ ] Task 3: Create message handler service (AC: #2)
  - [ ] Create `packages/server/src/application/services/SyncService.ts` or similar
  - [ ] Inject `RedisService` and `IGameRepository`
  - [ ] Implement sync message processing logic
  - [ ] Handle message parsing errors
  - [ ] Test: Test message handling with sample messages

- [ ] Task 4: Integrate subscription on server startup (AC: #1)
  - [ ] Update `main.ts` or application bootstrap
  - [ ] Subscribe to `game:sync:*` pattern on server start
  - [ ] Register message handler callback
  - [ ] Test: Test subscription on server startup

- [ ] Task 5: Implement client broadcast logic (AC: #2)
  - [ ] Update `GameGateway` or WebSocket handler
  - [ ] Implement method to broadcast to clients for a game
  - [ ] Map gameCode to connected clients
  - [ ] Send `update`/`win`/`draw` messages based on sync event
  - [ ] Test: Test broadcasting to connected clients

- [ ] Task 6: Handle multiple concurrent games (AC: #4)
  - [ ] Track active game subscriptions
  - [ ] Support multiple games simultaneously
  - [ ] Test: Test handling multiple games

- [ ] Task 7: Implement channel cleanup (AC: #4)
  - [ ] Unsubscribe from channels when games end
  - [ ] Clean up subscription tracking
  - [ ] Test: Test cleanup on game end

- [ ] Task 8: Error handling (AC: #4)
  - [ ] Handle subscription failures gracefully
  - [ ] Handle message parsing errors
  - [ ] Handle Redis read errors
  - [ ] Log errors with context
  - [ ] Test: Test error scenarios

- [ ] Task 9: Integration test (AC: #1, #2, #3, #4)
  - [ ] Write integration test with real Redis
  - [ ] Test subscription to sync channels
  - [ ] Test receiving sync messages
  - [ ] Test client broadcasting
  - [ ] Test: Verify end-to-end sync flow

## Dev Notes

### Architecture Patterns and Constraints

- **Pub/Sub Subscription**: Servers subscribe to sync channels to receive updates [Source: docs/architecture.md#Real-Time-Synchronization]
- **Pattern Subscription**: Use `game:sync:*` pattern for all game sync channels [Source: docs/epics.md#Story-4.4]
- **Use Case Pattern**: SyncGameStateUseCase handles sync message processing [Source: docs/architecture.md#Project-Structure]
- **Event-Driven**: Sync messages trigger client broadcasts [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]

### Project Structure Notes

- SyncGameStateUseCase lives in `packages/server/src/application/use-cases/`
- SyncService (if needed) lives in `packages/server/src/application/services/`
- Subscription setup happens in application bootstrap (main.ts)
- Client broadcasting handled by GameGateway

### Testing Standards

- **TDD Approach**: Write `SyncGameStateUseCase.test.ts` FIRST with mocked dependencies
- **Test Coverage**: Unit tests with mocked RedisService, integration tests with real Redis
- **Message Handling**: Test sync message parsing and processing
- **Client Broadcasting**: Test broadcasting to connected clients
- **Code Size**: Keep use case < 150 lines, methods < 15 lines each

### References

- [Source: docs/epics.md#Story-4.4-Server-Subscription-to-Sync-Channels]
- [Source: docs/architecture.md#Real-Time-Synchronization]
- [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]
- [Source: docs/sprint-planning.md#Story-4.4-Server-Subscription-to-Sync-Channels]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled during implementation -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled when story is complete -->

### File List

<!-- Will be filled during implementation -->

