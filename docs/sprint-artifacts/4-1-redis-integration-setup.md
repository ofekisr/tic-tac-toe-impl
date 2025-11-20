# Story 4.1: Redis Integration Setup

Status: done

## Story

As a developer,
I want Redis client integrated with the server,
So that I can store and retrieve game state across server instances.

## Acceptance Criteria

1. **Given** the server package exists (Story 1.4)
   **When** I integrate Redis client
   **Then** `packages/server/src/infrastructure/redis/redis.service.ts` exists with:
   - `RedisService` class using `ioredis` library
   - Connection to Redis server (host/port from environment variables)
   - Methods: `get()`, `set()`, `hget()`, `hset()`, `hgetall()`, `publish()`, `subscribe()`
   - Error handling for connection failures

2. **And** `packages/server/src/infrastructure/redis/redis.module.ts` exists and:
   - Provides `RedisService` as injectable provider
   - Configures Redis connection from environment variables
   - Can be imported by other modules

3. **And** environment variables configured:
   - `REDIS_HOST` (default: localhost)
   - `REDIS_PORT` (default: 6379)
   - `REDIS_PASSWORD` (optional)

4. **And** server can connect to Redis successfully

## Tasks / Subtasks

- [ ] Task 1: Install ioredis dependency (AC: #1)
  - [ ] Add `ioredis` to `packages/server/package.json` dependencies
  - [ ] Run `npm install` in server package
  - [ ] Test: Verify ioredis is installed

- [ ] Task 2: Create RedisService class (AC: #1)
  - [ ] Create `packages/server/src/infrastructure/redis/redis.service.ts`
  - [ ] Implement `RedisService` class with ioredis client
  - [ ] Implement `get(key: string): Promise<string | null>`
  - [ ] Implement `set(key: string, value: string): Promise<void>`
  - [ ] Implement `hget(key: string, field: string): Promise<string | null>`
  - [ ] Implement `hset(key: string, field: string, value: string): Promise<void>`
  - [ ] Implement `hgetall(key: string): Promise<Record<string, string>>`
  - [ ] Implement `publish(channel: string, message: string): Promise<void>`
  - [ ] Implement `subscribe(channel: string, callback: (message: string) => void): Promise<void>`
  - [ ] Add connection error handling
  - [ ] Test: Write unit tests with mocked ioredis

- [ ] Task 3: Create RedisModule (AC: #2)
  - [ ] Create `packages/server/src/infrastructure/redis/redis.module.ts`
  - [ ] Configure RedisService as provider
  - [ ] Configure Redis connection from environment variables
  - [ ] Export RedisService for use in other modules
  - [ ] Test: Verify module can be imported

- [ ] Task 4: Configure environment variables (AC: #3)
  - [ ] Document environment variables in README or .env.example
  - [ ] Set defaults: REDIS_HOST=localhost, REDIS_PORT=6379
  - [ ] Support optional REDIS_PASSWORD
  - [ ] Test: Verify environment variable reading

- [ ] Task 5: Integration test (AC: #4)
  - [ ] Write integration test connecting to Redis
  - [ ] Test basic operations (get, set, hget, hset)
  - [ ] Test connection failure handling
  - [ ] Test: Verify Redis connection works

## Dev Notes

### Architecture Patterns and Constraints

- **Redis Integration**: Architecture specifies ioredis for TypeScript-friendly Redis client [Source: docs/architecture.md#Technology-Stack-Details]
- **Infrastructure Layer**: RedisService belongs in infrastructure layer, implements IRedisClient interface [Source: docs/architecture.md#Project-Structure]
- **Dependency Injection**: RedisService provided via NestJS module system [Source: docs/architecture.md#Project-Structure]
- **Stateless Design**: Redis enables stateless server design for multi-server deployment [Source: docs/architecture.md#Executive-Summary]

### Project Structure Notes

- Redis infrastructure lives in `packages/server/src/infrastructure/redis/`
- RedisService provides low-level Redis operations
- RedisModule configures and exports RedisService
- Environment variables enable Docker Compose configuration

### Testing Standards

- **TDD Approach**: Write `RedisService.test.ts` FIRST with mocked ioredis
- **Test Coverage**: Unit tests with mocked ioredis client
- **Integration Tests**: Test actual Redis connection (requires Redis running)
- **Error Handling**: Test connection failures and error scenarios
- **Code Size**: Keep RedisService < 150 lines, methods < 15 lines each

### References

- [Source: docs/epics.md#Story-4.1-Redis-Integration-Setup]
- [Source: docs/architecture.md#Technology-Stack-Details]
- [Source: docs/sprint-planning.md#Story-4.1-Redis-Integration-Setup]

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

