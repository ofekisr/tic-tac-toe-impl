# Story 4.2: Game State Storage in Redis

Status: done

## Story

As a developer,
I want game state stored in Redis with proper structure,
So that multiple servers can access the same game data.

## Acceptance Criteria

1. **Given** a game is created or updated
   **When** game state is saved
   **Then** Redis stores game state as hash at key `game:{gameCode}` with fields:
   - `board`: JSON string of BoardDTO (BoardCell[][])
   - `currentPlayer`: 'X' or 'O'
   - `status`: 'waiting' | 'playing' | 'finished'
   - `winner`: 'X' | 'O' | null (as string or JSON)
   - `players`: JSON string of `{ X?: string, O?: string }` (connection IDs)
   - `createdAt`: ISO timestamp string
   - `updatedAt`: ISO timestamp string

2. **And** game state has TTL: 3600 seconds (1 hour) for automatic cleanup

3. **And** `RedisGameRepository` implements `IGameRepository` interface:
   - `create(game: Game): Promise<Game>`
   - `findByCode(gameCode: string): Promise<Game | null>`
   - `update(game: Game): Promise<Game>`

4. **And** repository converts between domain `Game` object and Redis hash format

## Tasks / Subtasks

- [ ] Task 1: Define IGameRepository interface (AC: #3)
  - [ ] Create `packages/server/src/domain/interfaces/IGameRepository.ts`
  - [ ] Define `create(game: Game): Promise<Game>`
  - [ ] Define `findByCode(gameCode: string): Promise<Game | null>`
  - [ ] Define `update(game: Game): Promise<Game>`
  - [ ] Test: Verify interface compiles

- [ ] Task 2: Create RedisGameRepository class (AC: #3)
  - [ ] Create `packages/server/src/infrastructure/redis/redis-game.repository.ts`
  - [ ] Implement `RedisGameRepository` class
  - [ ] Inject `RedisService` dependency
  - [ ] Implement `create(game: Game): Promise<Game>`
  - [ ] Implement `findByCode(gameCode: string): Promise<Game | null>`
  - [ ] Implement `update(game: Game): Promise<Game>`
  - [ ] Test: Write unit tests with mocked RedisService

- [ ] Task 3: Implement serialization methods (AC: #1, #4)
  - [ ] Create `serializeGame(game: Game): Record<string, string>` private method
  - [ ] Serialize board as JSON string (BoardDTO)
  - [ ] Serialize players object as JSON string
  - [ ] Convert winner to string (null handling)
  - [ ] Format timestamps as ISO strings
  - [ ] Test: Test serialization with sample Game object

- [ ] Task 4: Implement deserialization methods (AC: #4)
  - [ ] Create `deserializeGame(hash: Record<string, string>): Game` private method
  - [ ] Parse board JSON string to BoardDTO
  - [ ] Parse players JSON string to object
  - [ ] Parse winner (handle null)
  - [ ] Parse timestamps from ISO strings
  - [ ] Test: Test deserialization with sample Redis hash

- [ ] Task 5: Implement Redis key pattern (AC: #1)
  - [ ] Use key pattern `game:{gameCode}` for all operations
  - [ ] Create helper method `getGameKey(gameCode: string): string`
  - [ ] Test: Verify key pattern is correct

- [ ] Task 6: Implement TTL (AC: #2)
  - [ ] Set TTL to 3600 seconds (1 hour) when creating/updating games
  - [ ] Use Redis EXPIRE command via RedisService
  - [ ] Test: Verify TTL is set correctly

- [ ] Task 7: Integration test (AC: #1, #2, #3, #4)
  - [ ] Write integration test creating game in Redis
  - [ ] Test reading game from Redis
  - [ ] Test updating game in Redis
  - [ ] Test TTL expiration
  - [ ] Test: Verify full CRUD operations work

## Dev Notes

### Architecture Patterns and Constraints

- **Repository Pattern**: RedisGameRepository implements IGameRepository interface (Dependency Inversion) [Source: docs/architecture.md#Project-Structure]
- **Redis Hash Structure**: Game state stored as Redis hash for efficient access [Source: docs/epics.md#Story-4.2]
- **TTL Management**: Games expire after 1 hour to prevent abandoned games [Source: docs/epics.md#Story-4.2]
- **Serialization**: BoardDTO used for JSON serialization (BoardCell[][]) [Source: docs/architecture.md#Project-Structure]

### Project Structure Notes

- Repository lives in `packages/server/src/infrastructure/redis/redis-game.repository.ts`
- Interface defined in `packages/server/src/domain/interfaces/IGameRepository.ts`
- Repository depends on RedisService (infrastructure layer)
- Serialization/deserialization handles domain ↔ Redis conversion

### Testing Standards

- **TDD Approach**: Write `RedisGameRepository.test.ts` FIRST with mocked RedisService
- **Test Coverage**: Unit tests with mocked RedisService, integration tests with real Redis
- **Serialization Tests**: Test Game → Redis hash conversion
- **Deserialization Tests**: Test Redis hash → Game conversion
- **Code Size**: Keep repository < 150 lines, methods < 15 lines each

### References

- [Source: docs/epics.md#Story-4.2-Game-State-Storage-in-Redis]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/sprint-planning.md#Story-4.2-Game-State-Storage-in-Redis]

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

