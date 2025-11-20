# Story 4.3: Redis Pub/Sub for Server Synchronization

Status: todo

## Story

As a developer,
I want servers to publish game state updates via Redis pub/sub,
So that other servers are notified when game state changes.

## Acceptance Criteria

1. **Given** a server updates game state (after move, join, etc.)
   **When** game state is saved to Redis
   **Then** server publishes sync message to Redis channel `game:sync:{gameCode}` with:
   - JSON payload containing game state update
   - Message format: `{ gameCode: string, event: 'move' | 'join' | 'win' | 'draw', state: GameStateDTO }`

2. **And** `RedisService` implements:
   - `publish(channel: string, message: string): Promise<void>`
   - Publishes to Redis pub/sub channel

3. **And** publishing happens after every game state update:
   - After game creation
   - After player joins
   - After move is made
   - After win/draw detected

## Tasks / Subtasks

- [ ] Task 1: Extend RedisService publish method (AC: #2)
  - [ ] Verify `publish(channel: string, message: string): Promise<void>` exists in RedisService
  - [ ] Implement using ioredis pub/sub if not already implemented
  - [ ] Test: Write unit tests with mocked ioredis

- [ ] Task 2: Define sync message format (AC: #1)
  - [ ] Create type definition for sync message: `SyncMessage`
  - [ ] Define structure: `{ gameCode: string, event: 'move' | 'join' | 'win' | 'draw', state: GameStateDTO }`
  - [ ] Add to shared types or server types
  - [ ] Test: Verify type compiles

- [ ] Task 3: Create sync message builder utility (AC: #1)
  - [ ] Create `buildSyncMessage(gameCode: string, event: string, state: GameState): SyncMessage` function
  - [ ] Serialize GameState to GameStateDTO
  - [ ] Format as JSON string
  - [ ] Test: Test message building with sample data

- [ ] Task 4: Integrate publishing into game creation (AC: #3)
  - [ ] Update `CreateGameUseCase` or `GameService`
  - [ ] After creating game in Redis, publish sync message
  - [ ] Use channel pattern: `game:sync:{gameCode}`
  - [ ] Event type: `'join'` (game created)
  - [ ] Test: Test publishing after game creation

- [ ] Task 5: Integrate publishing into game joining (AC: #3)
  - [ ] Update `JoinGameUseCase` or `GameService`
  - [ ] After updating game state (player joins), publish sync message
  - [ ] Event type: `'join'` (player joined)
  - [ ] Test: Test publishing after player joins

- [ ] Task 6: Integrate publishing into move processing (AC: #3)
  - [ ] Update `MakeMoveUseCase` or `GameStateService`
  - [ ] After updating game state (move made), publish sync message
  - [ ] Event type: `'move'` (move made)
  - [ ] Test: Test publishing after move

- [ ] Task 7: Integrate publishing into win detection (AC: #3)
  - [ ] Update win detection logic in `GameStateService`
  - [ ] After detecting win, publish sync message
  - [ ] Event type: `'win'` (game won)
  - [ ] Test: Test publishing after win

- [ ] Task 8: Integrate publishing into draw detection (AC: #3)
  - [ ] Update draw detection logic in `GameStateService`
  - [ ] After detecting draw, publish sync message
  - [ ] Event type: `'draw'` (game drawn)
  - [ ] Test: Test publishing after draw

- [ ] Task 9: Integration test (AC: #1, #2, #3)
  - [ ] Write integration test with real Redis
  - [ ] Test publishing sync message
  - [ ] Test message format is correct
  - [ ] Test: Verify pub/sub publishing works end-to-end

## Dev Notes

### Architecture Patterns and Constraints

- **Pub/Sub Pattern**: Redis pub/sub enables real-time server-to-server communication [Source: docs/architecture.md#Real-Time-Synchronization]
- **Channel Pattern**: Use `game:sync:{gameCode}` for selective subscription [Source: docs/epics.md#Story-4.3]
- **Event-Driven**: Publishing happens after state changes (event-driven architecture) [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]
- **Message Format**: JSON payload with gameCode, event type, and state [Source: docs/epics.md#Story-4.3]

### Project Structure Notes

- Publishing logic integrated into use cases/services that update game state
- Sync message format defined in shared types or server types
- RedisService provides low-level publish operation
- Channel pattern allows selective subscription per game

### Testing Standards

- **TDD Approach**: Write tests FIRST for publish operations
- **Test Coverage**: Unit tests with mocked RedisService, integration tests with real Redis
- **Message Format**: Test sync message structure and serialization
- **Integration Points**: Test publishing from all state update points
- **Code Size**: Keep publishing logic < 100 lines, methods < 15 lines each

### References

- [Source: docs/epics.md#Story-4.3-Redis-Pub/Sub-for-Server-Synchronization]
- [Source: docs/architecture.md#Real-Time-Synchronization]
- [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]
- [Source: docs/sprint-planning.md#Story-4.3-Redis-Pub/Sub-for-Server-Synchronization]

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

