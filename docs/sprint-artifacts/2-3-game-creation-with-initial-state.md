# Story 2.3: Game Creation with Initial State

Status: drafted

## Story

As a player,
I want to create a new game and receive a game code,
So that I can share it with an opponent to start playing.

## Acceptance Criteria

1. **Given** a client sends `{ type: 'join', gameCode: 'NEW' }` message
   **When** the server processes the game creation request
   **Then** the server:
   - Generates a unique game code (Story 2.2)
   - Creates game state with:
     - Empty 3x3 board (all cells empty: `[["", "", ""], ["", "", ""], ["", "", ""]]`)
     - Status: `'waiting'`
     - Current player: `'X'`
     - No winner: `null`
     - Empty players object: `{ X: undefined, O: undefined }`
   - Stores game state in Redis with key `game:{gameCode}`
   - Assigns player 'X' to the creating client
   - Sends `joined` message to client with:
     - `type: 'joined'`
     - `gameCode: string` (generated code)
     - `board: BoardDTO` (empty 3x3 grid)
     - `currentPlayer: 'X'`
     - `status: 'waiting'`
     - `playerSymbol: 'X'`

2. **And** game state includes TTL (e.g., 3600 seconds = 1 hour) for automatic cleanup

## Tasks / Subtasks

- [ ] Task 1: Create Game entity/domain model (AC: #1)
  - [ ] Create `packages/server/src/domain/entities/Game.ts`
  - [ ] Define Game class with properties: `gameCode`, `board`, `status`, `currentPlayer`, `winner`, `players`, `createdAt`, `updatedAt`
  - [ ] Add constructor that initializes empty 3x3 board
  - [ ] Add method to convert to DTO: `toDTO(): GameDTO`
  - [ ] Test: Verify Game entity creates with correct initial state
  - [ ] Test: Verify empty board is 3x3 with all empty cells

- [ ] Task 2: Implement CreateGameUseCase (AC: #1)
  - [ ] Create `packages/server/src/application/use-cases/CreateGameUseCase.ts`
  - [ ] Inject `IGameRepository` and `GameCodeGenerator` (or utility)
  - [ ] Implement `execute(connectionId: string): Promise<GameDTO>`
  - [ ] Generate unique game code using GameCodeGenerator
  - [ ] Create Game entity with initial state (empty board, status 'waiting', currentPlayer 'X')
  - [ ] Assign player 'X' to connectionId in players object
  - [ ] Save game to repository with TTL (3600 seconds)
  - [ ] Return GameDTO with game code and initial state
  - [ ] Test: Mock repository and verify game creation flow
  - [ ] Test: Verify game code generation and uniqueness check
  - [ ] Test: Verify initial state is correct (empty board, waiting status)

- [ ] Task 3: Implement Redis game repository (AC: #1)
  - [ ] Create `packages/server/src/infrastructure/redis/redis-game.repository.ts`
  - [ ] Implement `IGameRepository` interface
  - [ ] Implement `create(game: Game, ttl: number): Promise<Game>`
  - [ ] Store game state in Redis hash at key `game:{gameCode}`
  - [ ] Set TTL on Redis key (3600 seconds)
  - [ ] Serialize board to BoardDTO format
  - [ ] Test: Mock Redis client and verify game storage
  - [ ] Test: Verify TTL is set correctly

- [ ] Task 4: Handle game creation in Gateway (AC: #1)
  - [ ] Open `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Inject `CreateGameUseCase`
  - [ ] Add message handler for `{ type: 'join', gameCode: 'NEW' }`
  - [ ] Call `CreateGameUseCase.execute(connectionId)`
  - [ ] Send `joined` message to client with game code and initial state
  - [ ] Test: Integration test with WebSocket client
  - [ ] Test: Verify joined message format matches specification

- [ ] Task 5: Implement message types in shared package (AC: #1)
  - [ ] Open `packages/shared/src/types/messages.ts`
  - [ ] Define `JoinGameMessage` type: `{ type: 'join', gameCode: string }`
  - [ ] Define `JoinedMessage` type with all required fields
  - [ ] Define `BoardDTO` type: `BoardCell[][]` (from shared types)
  - [ ] Test: Verify message types compile correctly
  - [ ] Test: Verify type guards work for message validation

## Dev Notes

### Learnings from Previous Story

**From Story 2.2 (Status: drafted)**

- **Game Code Generation**: GameCode value object or utility exists for generating unique codes [Source: docs/sprint-artifacts/2-2-game-code-generation.md]
- **Uniqueness Check**: Repository interface `IGameRepository` with `exists()` method for uniqueness validation [Source: docs/sprint-artifacts/2-2-game-code-generation.md]
- **GameService**: GameService class exists with `createGame()` method structure [Source: docs/sprint-artifacts/2-2-game-code-generation.md]
- **Use Existing**: Integrate game code generation with game creation flow

### Architecture Patterns and Constraints

- **Use Case Pattern**: Architecture specifies use-cases directory for application use cases [Source: docs/architecture.md#Project-Structure]
- **Repository Pattern**: Domain interfaces defined in `domain/interfaces/`, implemented in infrastructure layer [Source: docs/architecture.md#Project-Structure]
- **Game State Storage**: Redis stores game state as hash at key `game:{gameCode}` [Source: docs/architecture.md#Integration-Points]
- **TTL Configuration**: Game state has TTL (3600 seconds = 1 hour) for automatic cleanup [Source: docs/epics.md#Story-2.3-Game-Creation-with-Initial-State]
- **Initial Board State**: Empty 3x3 board format: `[["", "", ""], ["", "", ""], ["", "", ""]]` [Source: docs/epics.md#Story-2.3-Game-Creation-with-Initial-State]
- **Message Protocol**: Joined message includes initial board state per FR20 enhancement [Source: docs/epics.md#Story-2.3-Game-Creation-with-Initial-State]

### Project Structure Notes

- Game entity: `packages/server/src/domain/entities/Game.ts`
- Use case: `packages/server/src/application/use-cases/CreateGameUseCase.ts`
- Repository: `packages/server/src/infrastructure/redis/redis-game.repository.ts`
- Gateway: `packages/server/src/presentation/game/game.gateway.ts`
- Shared types: `packages/shared/src/types/messages.ts`
- Redis key pattern: `game:{gameCode}` for game state storage

### Testing Standards

- Domain entities: Pure unit tests (100% coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Use cases: Unit tests with mocked repository (90%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Repository: Unit tests with mocked Redis client, integration tests with real Redis (80%+ coverage) [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- Gateway: Integration tests with test WebSocket clients [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- TDD approach: Write tests first, then implement

### References

- [Source: docs/epics.md#Story-2.3-Game-Creation-with-Initial-State]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Integration-Points]
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

