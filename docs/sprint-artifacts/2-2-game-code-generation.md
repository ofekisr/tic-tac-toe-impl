# Story 2.2: Game Code Generation

Status: drafted

## Story

As a developer,
I want a system to generate unique game codes,
So that players can share codes to join the same game.

## Acceptance Criteria

1. **Given** a game creation request
   **When** I generate a game code
   **Then** the code is:
   - 6 alphanumeric characters (e.g., "ABC123", "XYZ789")
   - Unique (not already in use)
   - Case-sensitive
   - Generated using cryptographically secure random (or simple random for MVP)

2. **And** game code generation is implemented in:
   - Domain value object: `GameCode` (if using DDD) or utility function
   - Application service: `GameService.createGame()` generates code before creating game

3. **And** generated codes are stored with game state for validation

## Tasks / Subtasks

- [ ] Task 1: Create GameCode value object or utility (AC: #1, #2)
  - [ ] Create `packages/server/src/domain/value-objects/GameCode.ts` (or utility function)
  - [ ] Implement code generation function: `generateGameCode(): string`
  - [ ] Use crypto.randomBytes or Math.random for MVP (6 characters)
  - [ ] Generate alphanumeric characters (A-Z, a-z, 0-9)
  - [ ] Ensure code is exactly 6 characters
  - [ ] Test: Verify generated codes are 6 characters long
  - [ ] Test: Verify codes contain only alphanumeric characters
  - [ ] Test: Verify codes are case-sensitive (test uppercase/lowercase)

- [ ] Task 2: Implement uniqueness check (AC: #1)
  - [ ] Create interface `IGameRepository` with `exists(gameCode: string): Promise<boolean>` method
  - [ ] Implement uniqueness check: query Redis (or storage) to verify code doesn't exist
  - [ ] Add retry logic: if code exists, generate new code (max 10 retries)
  - [ ] Test: Mock repository to test uniqueness validation
  - [ ] Test: Verify retry logic works when duplicate code generated

- [ ] Task 3: Integrate code generation with game creation (AC: #2, #3)
  - [ ] Create `GameService` class in `packages/server/src/application/services/GameService.ts`
  - [ ] Add `createGame()` method that generates code before creating game
  - [ ] Call `generateGameCode()` and verify uniqueness
  - [ ] Store generated code with game state
  - [ ] Test: Verify code generation happens before game creation
  - [ ] Test: Verify generated code is stored with game state

## Dev Notes

### Learnings from Previous Story

**From Story 2.1 (Status: drafted)**

- **WebSocket Gateway**: GameGateway exists in `presentation/game/game.gateway.ts` [Source: docs/sprint-artifacts/2-1-websocket-server-setup-with-nestjs-gateway.md]
- **Game Module**: GameModule configured with WebSocketsModule [Source: docs/sprint-artifacts/2-1-websocket-server-setup-with-nestjs-gateway.md]
- **Connection Handling**: Connection/disconnection handlers implemented [Source: docs/sprint-artifacts/2-1-websocket-server-setup-with-nestjs-gateway.md]
- **Use Gateway**: Code generation will be used by GameGateway when handling game creation messages

### Architecture Patterns and Constraints

- **Domain Value Objects**: Architecture specifies domain/value-objects directory for value objects [Source: docs/architecture.md#Project-Structure]
- **Pure Domain Logic**: Domain layer should have no external dependencies (pure TypeScript) [Source: docs/architecture.md#Code-Organization]
- **Game Code Format**: 6 alphanumeric characters provides good balance of uniqueness and usability [Source: docs/epics.md#Story-2.2-Game-Code-Generation]
- **Uniqueness Validation**: Codes stored in Redis with game state for validation [Source: docs/epics.md#Story-2.2-Game-Code-Generation]
- **Random Generation**: Simple random generation acceptable for MVP (crypto.randomBytes for production) [Source: docs/epics.md#Story-2.2-Game-Code-Generation]

### Project Structure Notes

- Value object location: `packages/server/src/domain/value-objects/GameCode.ts`
- Service location: `packages/server/src/application/services/GameService.ts`
- Repository interface: `packages/server/src/domain/interfaces/IGameRepository.ts`
- GameCode should be a pure domain value object (no infrastructure dependencies)
- Uniqueness check requires repository interface (will be implemented in infrastructure layer)

### Testing Standards

- Domain value objects: Pure unit tests with no mocks (100% coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Test code generation logic thoroughly
- Test uniqueness validation with mocked repository
- Test retry logic for duplicate codes
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.2-Game-Code-Generation]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Code-Organization]
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

