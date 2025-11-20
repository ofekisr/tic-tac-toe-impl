# fusion-tic-tac-toe - Epic Breakdown

**Author:** ofeki
**Date:** 2025-11-20
**Project Level:** MVP
**Target Scale:** Low complexity, 4-hour implementation window

---

## Overview

This document provides the complete epic and story breakdown for fusion-tic-tac-toe, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows add interaction and technical details to stories.

---

## Functional Requirements Inventory

**Game Management (FR1-FR5):**
- FR1: Clients can create a new game session and receive a unique game code
- FR2: Clients can join an existing game session using a game code
  - **Enhancement:** Once a game has started (status = 'playing'), no additional players can join (game is full)
- FR3: System can track which player (X or O) is assigned to which client
- FR4: System can manage game state (board, current turn, game status) for each active game
- FR5: System can support multiple concurrent game sessions

**Gameplay (FR6-FR13):**
- FR6: Players can submit moves by specifying row and column coordinates
  - **Enhancement:** Client must prevent sending move messages to server when it's not the player's turn (client-side turn validation)
  - **Enhancement:** Client must ignore user input when it's not the player's turn (disable input or show "waiting" message)
- FR7: System validates moves before accepting them (check turn, check cell availability)
- FR8: System rejects invalid moves (wrong turn, occupied cell, out of bounds)
- FR9: System updates game state after valid moves
- FR10: System determines whose turn it is (X or O) and enforces turn order
- FR11: System detects when a player wins (three in a row horizontally, vertically, or diagonally)
- FR12: System detects when the game ends in a draw (board full, no winner)
- FR13: System notifies both players when game ends (win or draw)

**Real-Time Synchronization (FR14-FR17):**
- FR14: System synchronizes game state between Server A and Server B in real-time
- FR15: Moves made on one server immediately reflect on clients connected to the other server
- FR16: Both servers maintain consistent game state throughout gameplay
- FR17: System propagates game state updates to all connected clients for a game session

**Client Interface (FR18-FR24):**
- FR18: CLI client can connect to Server A (port 3001) via WebSocket
- FR19: CLI client can connect to Server B (port 3002) via WebSocket
- FR20: CLI client displays the current game board in ASCII format
  - **Enhancement:** Client MUST display initial board state immediately upon joining/starting a game (when receiving 'joined' message from server)
  - **Enhancement:** Initial board state shows empty 3x3 grid with clear row/column labels
- FR21: CLI client accepts user input for row and column coordinates
  - **Enhancement:** Client provides user tolerance for input mistakes - allows retry on invalid input
  - **Enhancement:** Client validates input format before sending (e.g., must be "row col" or "row,col" with values 0-2)
  - **Enhancement:** Client shows clear error messages for invalid input and prompts user to try again
  - **Enhancement:** Client may limit input choices (e.g., only accept valid coordinates, prevent out-of-bounds input)
- FR22: CLI client displays real-time board updates when opponent makes a move
  - **Enhancement:** Client MUST display updated board state after EVERY move (both own moves and opponent moves)
  - **Enhancement:** After user submits a move, client receives 'update'/'win'/'draw' message and immediately displays the new board state
  - **Enhancement:** Board display refreshes automatically when opponent makes a move (via 'update' message)
- FR23: CLI client shows game status messages (waiting for opponent, your turn, game over)
- FR24: CLI client displays win/draw notifications with winner information

**Communication Protocol (FR25-FR29):**
- FR25: System uses WebSocket for client-server communication
- FR26: System uses structured JSON messages for all communications
- FR27: System supports message types: join, move, update, win, draw, error
  - **Enhancement:** 'joined' message MUST include initial board state (empty 3x3 grid) when client joins/creates game
  - **Enhancement:** 'update' message MUST include updated board state after each move (both own and opponent moves)
  - **Enhancement:** 'win' and 'draw' messages MUST include final board state
- FR28: System validates incoming message structure and required fields
- FR29: System sends appropriate error messages for invalid requests

**Error Handling (FR30-FR32):**
- FR30: System provides error handling framework for connection failures
- FR31: System provides error handling framework for invalid game codes
- FR32: System provides error handling framework for server synchronization failures

**Total:** 32 functional requirements (with enhancements for game join restrictions, client-side turn validation, user input tolerance, initial board state display, and board updates after moves)

---

## FR Coverage Map

**Epic 1 (Foundation):** Infrastructure needs for all FRs
- Establishes project structure, build system, deployment pipeline, testing framework

**Epic 2 (Game Session Management):** FR1, FR2 (with join restriction), FR3, FR5, FR18, FR19, FR25, FR26, FR27, FR28, FR29, FR30, FR31
- Game creation, joining, player assignment, WebSocket communication, message protocol, error handling for connections and game codes

**Epic 3 (Core Gameplay):** FR4, FR6 (with client-side turn validation), FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR20, FR21 (with input tolerance), FR22, FR23, FR24
- Move submission, validation, turn management, win/draw detection, CLI interface, real-time board updates

**Epic 4 (Multi-Server Synchronization):** FR14, FR15, FR16, FR17, FR32
- Real-time state sync between servers, Redis pub/sub, state consistency, sync error handling

**Validation:** All 32 FRs are covered across the 4 epics.

---

## Epic Summary

### Epic 1: Foundation
**Goal:** Establish project infrastructure and development environment for the fusion-tic-tac-toe system.

**Value Delivered:** Development foundation enabling all subsequent work. This is a necessary exception for greenfield projects.

**Scope:**
- Monorepo structure with npm workspaces
- TypeScript configuration with strict mode
- NestJS server framework setup
- Docker Compose configuration for Redis and servers
- Testing framework (Jest) configuration
- Build system and development scripts
- Project documentation structure

**FR Coverage:** Infrastructure needs for all FRs

---

### Epic 2: Game Session Management
**Goal:** Enable players to create new games and join existing games via WebSocket connections.

**Value Delivered:** Users can create game sessions, receive game codes, and join games. Players can establish connections and begin game setup.

**Scope:**
- WebSocket server setup (NestJS Gateway)
- Game creation with unique code generation
- Game joining with validation (prevent joining started games)
- Player assignment (X or O)
- WebSocket message protocol (join, joined, error messages)
- Message validation and error handling
- Connection management
- Support for multiple concurrent game sessions

**FR Coverage:** FR1, FR2 (with join restriction), FR3, FR5, FR18, FR19, FR25, FR26, FR27, FR28, FR29, FR30, FR31

---

### Epic 3: Core Gameplay
**Goal:** Enable complete Tic-Tac-Toe gameplay with move validation, turn management, win/draw detection, and CLI interface.

**Value Delivered:** Users can play complete Tic-Tac-Toe games. Players can make moves, see real-time updates, and receive game results.

**Scope:**
- Move submission with row/column coordinates
- Server-side move validation (turn, cell availability, bounds)
- Client-side turn validation (prevent sending moves when not turn, ignore input)
- Turn management and enforcement
- Board state management
- Win condition detection (three in a row)
- Draw condition detection (board full)
- Game end notifications
- CLI client interface (ASCII board display)
- User input handling with tolerance (validation, retry, clear errors)
- Real-time board updates
- Game status messages

**FR Coverage:** FR4, FR6 (with client-side turn validation), FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR20, FR21 (with input tolerance), FR22, FR23, FR24

---

### Epic 4: Multi-Server Synchronization
**Goal:** Synchronize game state across multiple independent servers in real-time using Redis pub/sub.

**Value Delivered:** Real-time game state synchronization works across servers. Moves made on one server immediately reflect on clients connected to other servers.

**Scope:**
- Redis integration (ioredis client)
- Redis pub/sub for server-to-server communication
- Game state synchronization protocol
- State consistency across servers
- Real-time update propagation
- Error handling for synchronization failures
- Server-to-server message handling

**FR Coverage:** FR14, FR15, FR16, FR17, FR32

---

## Epic 1: Foundation

**Goal:** Establish project infrastructure and development environment for the fusion-tic-tac-toe system.

### Story 1.1: Project Structure and Package Initialization

As a developer,
I want a monorepo structure with npm workspaces set up,
So that I can develop server and client packages independently with shared types.

**Acceptance Criteria:**

**Given** a new project directory
**When** I initialize the project structure
**Then** the following structure is created:
- Root `package.json` with npm workspaces configuration
- `packages/shared/` directory for shared TypeScript types
- `packages/server/` directory for NestJS server implementation
- `packages/client/` directory for CLI client implementation
- `packages/mock-server/` directory for standalone mock server
- Root `tsconfig.json` for TypeScript configuration
- `.gitignore` file excluding `node_modules`, `dist`, `.env` files
- `README.md` with project overview

**And** root `package.json` includes:
- Workspaces configuration: `["packages/*"]`
- Scripts for building all packages: `"build": "npm run build --workspaces"`
- Scripts for testing all packages: `"test": "npm run test --workspaces"`
- Development scripts: `"dev:server"`, `"dev:client"`, `"dev:mock-server"`

**Prerequisites:** None (first story)

**Technical Notes:**
- Use npm workspaces for monorepo management
- Root package.json should be private: `"private": true`
- Workspace structure enables parallel development of client and server
- Shared types package allows contract-first development

---

### Story 1.2: TypeScript Configuration

As a developer,
I want TypeScript configured with strict mode across all packages,
So that I have type safety and better developer experience.

**Acceptance Criteria:**

**Given** the project structure exists
**When** I configure TypeScript
**Then** root `tsconfig.json` includes:
- `"strict": true` for maximum type safety
- `"target": "ES2022"` for modern JavaScript features
- `"module": "commonjs"` or `"ESNext"` based on Node.js version
- `"esModuleInterop": true` for compatibility
- `"skipLibCheck": true` for faster compilation
- `"forceConsistentCasingInFileNames": true` for cross-platform compatibility

**And** each package (`shared`, `server`, `client`, `mock-server`) has its own `tsconfig.json` that:
- Extends root `tsconfig.json`
- Sets appropriate `outDir` (e.g., `"dist"` or `"build"`)
- Includes source files: `"include": ["src/**/*"]`
- Excludes test files from compilation if needed

**And** TypeScript compilation succeeds with no errors for all packages

**Prerequisites:** Story 1.1

**Technical Notes:**
- Strict mode catches type errors at compile time
- Consistent configuration across packages ensures compatibility
- Separate tsconfig.json per package allows package-specific settings

---

### Story 1.3: Shared Types Package Setup

As a developer,
I want a shared types package with WebSocket message contracts,
So that client and server can implement against the same protocol.

**Acceptance Criteria:**

**Given** the `packages/shared/` directory exists
**When** I set up the shared types package
**Then** `packages/shared/package.json` includes:
- Package name: `"@fusion-tic-tac-toe/shared"`
- TypeScript as dependency
- Build script: `"build": "tsc"`
- Test script configured for Jest

**And** `packages/shared/src/types/` directory contains:
- `messages.ts` with WebSocket message type definitions (JoinGameMessage, MakeMoveMessage, JoinedMessage, UpdateMessage, WinMessage, DrawMessage, ErrorMessage)
- `game.ts` with game state types (Board, BoardDTO, Move, GameState, PlayerSymbol, GameStatus)
- `errors.ts` with ErrorCode enum and error types
- `index.ts` exporting all types

**And** types are properly exported and can be imported by other packages

**Prerequisites:** Story 1.2

**Technical Notes:**
- Shared types enable contract-first development
- Both client and server import from `@fusion-tic-tac-toe/shared`
- Type definitions match architecture document specifications
- Board type uses BoardDTO for serialization (BoardCell[][])

---

### Story 1.4: Server Package Setup with NestJS

As a developer,
I want the server package configured with NestJS and TypeScript,
So that I can build the WebSocket server with dependency injection and clean architecture.

**Acceptance Criteria:**

**Given** the `packages/server/` directory exists
**When** I set up the server package
**Then** `packages/server/package.json` includes:
- Dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-ws`, `@nestjs/websockets`, `ioredis`
- Dev dependencies: `typescript`, `@types/node`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `@nestjs/testing`, `ts-jest`
- Scripts: `"build"`, `"start"`, `"dev"` (with nodemon), `"test"`

**And** `packages/server/src/` directory structure includes:
- `domain/` directory for domain layer (entities, interfaces, value objects)
- `application/` directory for application layer (services, use cases)
- `infrastructure/` directory for infrastructure layer (Redis, WebSocket implementations)
- `presentation/` directory for presentation layer (Gateways, Controllers)
- `main.ts` for application bootstrap

**And** `packages/server/src/main.ts` can be executed and starts a NestJS application (even if minimal)

**Prerequisites:** Story 1.2

**Technical Notes:**
- NestJS provides WebSocket Gateway pattern via `@nestjs/websockets`
- Layered architecture follows SOLID/DRY principles
- Dependency injection enables interface-based design
- Jest integration supports TDD workflow

---

### Story 1.5: Client Package Setup

As a developer,
I want the client package configured with TypeScript and WebSocket client library,
So that I can build the CLI client interface.

**Acceptance Criteria:**

**Given** the `packages/client/` directory exists
**When** I set up the client package
**Then** `packages/client/package.json` includes:
- Dependencies: `ws` (WebSocket client), `@fusion-tic-tac-toe/shared` (shared types)
- Dev dependencies: `typescript`, `@types/node`, `@types/ws`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `ts-jest`
- Scripts: `"build"`, `"start"`, `"dev"`, `"test"`

**And** `packages/client/src/` directory structure includes:
- `domain/` directory (entities, interfaces)
- `application/` directory (services, use cases)
- `infrastructure/` directory (WebSocket client implementation, mocks)
- `presentation/` directory (CLI interface, board renderer, input handler)

**And** client can import shared types from `@fusion-tic-tac-toe/shared`

**Prerequisites:** Story 1.3

**Technical Notes:**
- Client uses `ws` library for WebSocket connections
- Shared types ensure protocol compatibility
- Layered structure mirrors server architecture for consistency
- Mock server enables independent client development

---

### Story 1.6: Docker Compose Configuration

As a developer,
I want Docker Compose configuration for Redis and server instances,
So that I can run the complete system locally with proper orchestration.

**Acceptance Criteria:**

**Given** Docker and Docker Compose are installed
**When** I create `docker-compose.yml`
**Then** the file defines services:
- `redis`: Redis server on port 6379
- `app1`: Server instance on port 3001 (Server A)
- `app2`: Server instance on port 3002 (Server B)
- `nginx`: Load balancer on port 80 (optional for MVP)

**And** each server service:
- Builds from `packages/server/` directory
- Sets environment variables: `REDIS_HOST=redis`, `REDIS_PORT=6379`, `SERVER_PORT` (3001 or 3002), `SERVER_ID` (server-a or server-b)
- Depends on `redis` service
- Exposes appropriate ports

**And** running `docker-compose up` starts all services successfully

**Prerequisites:** Story 1.4

**Technical Notes:**
- Docker Compose enables easy local development
- Two server instances demonstrate multi-server synchronization
- Redis service provides shared state storage
- Environment variables configure server behavior

---

### Story 1.7: Testing Framework Configuration

As a developer,
I want Jest configured for all packages with TypeScript support,
So that I can write and run tests following TDD principles.

**Acceptance Criteria:**

**Given** all packages are set up
**When** I configure Jest
**Then** each package has `jest.config.js` or Jest configuration in `package.json`:
- TypeScript support via `ts-jest` preset
- Test file pattern: `**/*.test.ts` or `**/*.spec.ts`
- Coverage reporting enabled
- Module path mapping configured if needed

**And** root-level test script runs tests for all packages: `npm test`

**And** I can write a simple test in any package and it executes successfully:
```typescript
describe('Example', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

**Prerequisites:** Stories 1.2, 1.4, 1.5

**Technical Notes:**
- Jest is industry standard for TypeScript projects
- TDD workflow requires tests to run quickly and reliably
- Coverage reporting helps ensure test quality
- NestJS provides testing utilities via `@nestjs/testing`

---

## Epic 2: Game Session Management

**Goal:** Enable players to create new games and join existing games via WebSocket connections.

### Story 2.1: WebSocket Server Setup with NestJS Gateway

As a developer,
I want a WebSocket server using NestJS Gateway,
So that clients can establish persistent connections for real-time communication.

**Acceptance Criteria:**

**Given** the server package is set up (Story 1.4)
**When** I create the WebSocket Gateway
**Then** `packages/server/src/presentation/game/game.gateway.ts` exists with:
- `@WebSocketGateway()` decorator configured for port 3001 (or from environment)
- `handleConnection()` method that logs new connections
- `handleDisconnect()` method that logs disconnections
- Basic WebSocket message handling structure

**And** `packages/server/src/presentation/game/game.module.ts` exists and:
- Imports `WebSocketsModule` from `@nestjs/websockets`
- Provides `GameGateway` as a provider
- Can be imported by `AppModule`

**And** server starts successfully and accepts WebSocket connections on configured port

**Prerequisites:** Story 1.4

**Technical Notes:**
- NestJS Gateway pattern provides clean WebSocket abstraction
- Gateway handles connection lifecycle automatically
- Port configuration via environment variable enables multiple server instances
- Connection tracking needed for game session management

---

### Story 2.2: Game Code Generation

As a developer,
I want a system to generate unique game codes,
So that players can share codes to join the same game.

**Acceptance Criteria:**

**Given** a game creation request
**When** I generate a game code
**Then** the code is:
- 6 alphanumeric characters (e.g., "ABC123", "XYZ789")
- Unique (not already in use)
- Case-sensitive
- Generated using cryptographically secure random (or simple random for MVP)

**And** game code generation is implemented in:
- Domain value object: `GameCode` (if using DDD) or utility function
- Application service: `GameService.createGame()` generates code before creating game

**And** generated codes are stored with game state for validation

**Prerequisites:** Story 2.1

**Technical Notes:**
- Game codes enable players to find and join specific games
- 6 characters provide good balance of uniqueness and usability
- Codes stored in Redis with game state for validation
- Simple random generation acceptable for MVP (crypto.randomBytes for production)

---

### Story 2.3: Game Creation with Initial State

As a player,
I want to create a new game and receive a game code,
So that I can share it with an opponent to start playing.

**Acceptance Criteria:**

**Given** a client sends `{ type: 'join', gameCode: 'NEW' }` message
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

**And** game state includes TTL (e.g., 3600 seconds = 1 hour) for automatic cleanup

**Prerequisites:** Stories 2.1, 2.2

**Technical Notes:**
- Game creation initializes all required state fields
- Redis storage enables stateless server design
- TTL prevents abandoned games from consuming resources
- 'joined' message includes initial board state per FR20 enhancement

---

### Story 2.4: Game Joining with Validation

As a player,
I want to join an existing game using a game code,
So that I can play against the game creator.

**Acceptance Criteria:**

**Given** a game exists with status `'waiting'` and one player (X)
**When** a second client sends `{ type: 'join', gameCode: 'ABC123' }` message
**Then** the server:
- Validates game code exists in Redis
- Validates game status is `'waiting'` (not `'playing'` or `'finished'`)
- Validates game has space (only one player currently)
- Assigns player 'O' to the joining client
- Updates game state:
  - Status: `'playing'`
  - Players: `{ X: 'connection-id-1', O: 'connection-id-2' }`
  - Current player: `'X'` (first player's turn)
- Stores updated game state in Redis
- Sends `joined` message to joining client with:
  - `type: 'joined'`
  - `gameCode: string`
  - `board: BoardDTO` (current board state)
  - `currentPlayer: 'X'`
  - `status: 'playing'`
  - `playerSymbol: 'O'`
- Sends `update` message to first client (X) with:
  - `type: 'update'`
  - `gameCode: string`
  - `board: BoardDTO`
  - `currentPlayer: 'X'`
  - `status: 'playing'`

**Given** a game exists with status `'playing'` (two players already)
**When** a third client tries to join
**Then** the server sends error message:
- `type: 'error'`
- `code: 'GAME_FULL'`
- `message: 'Game already has two players'`

**Prerequisites:** Story 2.3

**Technical Notes:**
- Join validation prevents joining started/finished games (FR2 enhancement)
- Player assignment tracks which connection is X and which is O
- Both clients receive appropriate messages (joined vs update)
- Error handling provides clear feedback for invalid join attempts

---

### Story 2.5: WebSocket Message Protocol Implementation

As a developer,
I want structured JSON message types for WebSocket communication,
So that client and server can exchange game data reliably.

**Acceptance Criteria:**

**Given** shared types package exists (Story 1.3)
**When** I implement the message protocol
**Then** `packages/shared/src/types/messages.ts` defines:
- Client → Server messages: `JoinGameMessage`, `MakeMoveMessage`
- Server → Client messages: `JoinedMessage`, `UpdateMessage`, `WinMessage`, `DrawMessage`, `ErrorMessage`
- Type guards: `isClientMessage()`, `isServerMessage()`

**And** message types match architecture specification:
- `JoinGameMessage`: `{ type: 'join', gameCode: string }`
- `MakeMoveMessage`: `{ type: 'move', gameCode: string, row: number, col: number }`
- `JoinedMessage`: `{ type: 'joined', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: GameStatus, playerSymbol: PlayerSymbol }`
- `UpdateMessage`: `{ type: 'update', gameCode: string, board: BoardDTO, currentPlayer: PlayerSymbol, status: 'playing' }`
- `WinMessage`: `{ type: 'win', gameCode: string, board: BoardDTO, winner: PlayerSymbol }`
- `DrawMessage`: `{ type: 'draw', gameCode: string, board: BoardDTO }`
- `ErrorMessage`: `{ type: 'error', code: ErrorCode, message: string, details?: unknown }`

**And** server Gateway validates incoming messages using type guards

**Prerequisites:** Stories 1.3, 2.1

**Technical Notes:**
- Shared types ensure protocol consistency between client and server
- Type guards enable runtime validation of messages
- BoardDTO (BoardCell[][]) used for JSON serialization
- Error codes defined in shared types for consistent error handling

---

### Story 2.6: Message Validation and Error Handling

As a player,
I want clear error messages when my requests are invalid,
So that I understand what went wrong and how to fix it.

**Acceptance Criteria:**

**Given** a client sends an invalid message
**When** the server receives it
**Then** the server validates:
- Message is valid JSON
- Message has required `type` field
- Message type is recognized (`'join'` or `'move'`)
- Required fields are present (e.g., `gameCode` for join/move, `row`/`col` for move)

**And** if validation fails, server sends error message:
- `type: 'error'`
- `code: 'INVALID_MESSAGE'`
- `message: string` describing the issue (e.g., "Missing required field: gameCode")

**Given** a client sends `{ type: 'join', gameCode: 'INVALID' }` for non-existent game
**When** the server processes it
**Then** server sends error:
- `type: 'error'`
- `code: 'GAME_NOT_FOUND'`
- `message: "Game code 'INVALID' does not exist"`

**Prerequisites:** Story 2.5

**Technical Notes:**
- Message validation prevents malformed requests from causing errors
- Clear error codes enable client-side error handling
- Error messages should be user-friendly but include details for debugging
- Validation happens before business logic processing

---

### Story 2.7: Connection Management and Cleanup

As a developer,
I want proper WebSocket connection lifecycle management,
So that disconnected clients don't leave orphaned game state.

**Acceptance Criteria:**

**Given** a client is connected and joined to a game
**When** the client disconnects (WebSocket close event)
**Then** the server:
- Detects disconnection in `handleDisconnect()` method
- Removes connection from game's player tracking (if applicable)
- Updates game state if needed (e.g., mark player as disconnected)
- Logs disconnection event for debugging

**And** if both players disconnect:
- Game state remains in Redis (with TTL)
- Game can be rejoined if players reconnect (optional for MVP)

**And** connection tracking maps WebSocket connections to:
- Game codes they're participating in
- Player symbols (X or O) assigned to them

**Prerequisites:** Story 2.1

**Technical Notes:**
- Connection cleanup prevents memory leaks
- Disconnection handling needed for graceful degradation
- Connection tracking enables message routing to specific clients
- Redis TTL handles abandoned games automatically

---

## Epic 3: Core Gameplay

**Goal:** Enable complete Tic-Tac-Toe gameplay with move validation, turn management, win/draw detection, and CLI interface.

### Story 3.1: Domain Layer - Board and Move Value Objects

As a developer,
I want Board and Move value objects in the domain layer,
So that game logic is pure and testable without external dependencies.

**Acceptance Criteria:**

**Given** the domain layer structure exists
**When** I create Board value object
**Then** `packages/server/src/domain/value-objects/Board.ts` (or `packages/shared/src/types/game.ts`) includes:
- `Board` class with private `cells: BoardCell[][]`
- Constructor that creates empty 3x3 board or validates provided cells
- Methods: `getCell(row, col)`, `setCell(row, col, value)`, `isEmpty(row, col)`, `isFull()`, `toArray()`
- Validation: ensures 3x3 size, validates positions (0-2 range)
- Static method: `Board.fromArray(cells: BoardCell[][])`

**And** `packages/server/src/domain/value-objects/Move.ts` includes:
- `Move` class with `row`, `col`, `player`, `timestamp` properties
- Constructor validates position (0-2 range)
- Methods: `toPosition()`, `equals(other: Move)`

**And** both classes have no external dependencies (pure TypeScript)

**Prerequisites:** Story 1.4

**Technical Notes:**
- Value objects encapsulate game rules and validation
- Board type provides type safety over raw arrays
- Move encapsulation enables move history tracking
- Pure domain objects enable easy unit testing

---

### Story 3.2: Move Validation Service

As a player,
I want my moves validated before they're accepted,
So that invalid moves are rejected with clear reasons.

**Acceptance Criteria:**

**Given** a move request `{ type: 'move', gameCode: 'ABC123', row: 1, col: 1 }`
**When** the server validates the move
**Then** validation checks:
- Game exists and is in `'playing'` status
- It's the requesting player's turn (currentPlayer matches playerSymbol)
- Cell is empty (not occupied by X or O)
- Position is valid (row and col are 0, 1, or 2)
- Game is not finished (status is not `'finished'`)

**And** if any validation fails, server sends error:
- `type: 'error'`
- `code: 'NOT_YOUR_TURN'` | `'CELL_OCCUPIED'` | `'INVALID_POSITION'` | `'GAME_ALREADY_FINISHED'`
- `message: string` describing the issue

**And** validation is implemented in `MoveValidationService` with:
- `validateMove(game: Game, move: Move, playerSymbol: PlayerSymbol): ValidationResult`
- Returns success or specific error code

**Prerequisites:** Stories 2.4, 3.1

**Technical Notes:**
- Move validation prevents invalid game states
- Server-side validation is critical (never trust client)
- Clear error codes enable client-side error handling
- Validation service is pure business logic (no infrastructure dependencies)

---

### Story 3.3: Turn Management and Move Processing

As a player,
I want moves to be processed only when it's my turn,
So that turn order is enforced correctly.

**Acceptance Criteria:**

**Given** a valid move request from player X
**When** currentPlayer is 'X' and game status is 'playing'
**Then** the server:
- Validates move (Story 3.2)
- Updates board: sets cell at (row, col) to 'X'
- Updates currentPlayer to 'O' (alternates turn)
- Updates game state in Redis
- Sends `update` message to both players with new board state

**Given** a move request from player X
**When** currentPlayer is 'O' (not X's turn)
**Then** server sends error:
- `type: 'error'`
- `code: 'NOT_YOUR_TURN'`
- `message: "It's not your turn. Current player: O"`

**And** turn alternation logic:
- After X moves → currentPlayer becomes 'O'
- After O moves → currentPlayer becomes 'X'
- Turn alternation happens automatically after valid move

**Prerequisites:** Story 3.2

**Technical Notes:**
- Turn management ensures fair gameplay
- Server enforces turn order (client-side validation is UX only)
- Turn alternation is atomic with board update
- Both players receive update messages for state consistency

---

### Story 3.4: Win Condition Detection

As a player,
I want the game to detect when I win,
So that the game ends correctly when I get three in a row.

**Acceptance Criteria:**

**Given** a board state with three X's in a row (horizontally, vertically, or diagonally)
**When** the server checks win conditions after a move
**Then** win detection identifies:
- Horizontal wins: same symbol in any row (e.g., row 0: [X, X, X])
- Vertical wins: same symbol in any column (e.g., col 1: [X, X, X])
- Diagonal wins: same symbol in main diagonal (0,0 → 2,2) or anti-diagonal (0,2 → 2,0)

**And** if win detected:
- Game status updated to `'finished'`
- Winner set to winning player symbol ('X' or 'O')
- Game state saved to Redis
- Server sends `win` message to both players:
  - `type: 'win'`
  - `gameCode: string`
  - `board: BoardDTO` (final board state)
  - `winner: PlayerSymbol`

**And** win detection is implemented in `GameStateService.checkWinCondition(board: Board): PlayerSymbol | null`

**Prerequisites:** Story 3.3

**Technical Notes:**
- Win detection runs after every valid move
- Three-in-a-row logic checks all 8 possible winning combinations (3 rows + 3 cols + 2 diagonals)
- Win detection is pure function (no side effects)
- Game ends immediately when win detected (no further moves allowed)

---

### Story 3.5: Draw Condition Detection

As a player,
I want the game to detect draws,
So that games end correctly when the board is full with no winner.

**Acceptance Criteria:**

**Given** a board state where all 9 cells are filled (no empty cells)
**When** no player has three in a row (no winner)
**Then** draw detection identifies:
- Board is full: `board.isFull()` returns true
- No winner: `checkWinCondition()` returns null

**And** if draw detected:
- Game status updated to `'finished'`
- Winner remains `null`
- Game state saved to Redis
- Server sends `draw` message to both players:
  - `type: 'draw'`
  - `gameCode: string`
  - `board: BoardDTO` (final board state)

**And** draw detection runs after win check (if no win, check for draw)

**Prerequisites:** Story 3.4

**Technical Notes:**
- Draw detection ensures games don't continue indefinitely
- Draw check happens after win check (win takes precedence)
- Board.isFull() method provides clean API for draw detection
- Both players receive draw notification simultaneously

---

### Story 3.6: CLI Client - WebSocket Connection

As a player,
I want to connect to the game server via WebSocket,
So that I can participate in games.

**Acceptance Criteria:**

**Given** the client package is set up (Story 1.5)
**When** I start the CLI client
**Then** client:
- Prompts for server URL (defaults to `ws://localhost:3001` or `ws://localhost:3002`)
- Establishes WebSocket connection using `ws` library
- Handles connection events: `open`, `error`, `close`
- Shows connection status to user ("Connecting...", "Connected", "Disconnected")

**And** `packages/client/src/infrastructure/websocket/WebSocketClient.ts` implements:
- `connect(url: string): Promise<void>`
- `disconnect(): Promise<void>`
- `send(message: ClientMessage): void`
- `onMessage(handler: (message: ServerMessage) => void): void`
- `onError(handler: (error: Error) => void): void`
- `onClose(handler: () => void): void`
- `isConnected(): boolean`

**And** client can connect to Server A (port 3001) or Server B (port 3002)

**Prerequisites:** Story 1.5

**Technical Notes:**
- WebSocket client enables real-time bidirectional communication
- Connection management handles network issues gracefully
- Event handlers enable reactive UI updates
- Client uses shared message types for protocol compatibility

---

### Story 3.7: CLI Client - Initial Board Display

As a player,
I want to see the initial board state when I join a game,
So that I know the game has started and can see the empty board.

**Acceptance Criteria:**

**Given** a client receives `joined` message from server
**When** the message includes `board: BoardDTO` (empty 3x3 grid)
**Then** client displays board in ASCII format:
```
    0   1   2
0  [ ] [ ] [ ]
1  [ ] [ ] [ ]
2  [ ] [ ] [ ]
```

**And** board display includes:
- Row and column labels (0, 1, 2)
- Empty cells shown as `[ ]`
- Clear visual separation between cells

**And** `packages/client/src/presentation/cli/BoardRenderer.ts` implements:
- `renderBoard(board: BoardDTO): string` - converts BoardDTO to ASCII string
- `displayBoard(board: BoardDTO): void` - prints board to console

**And** board is displayed immediately upon receiving `joined` message (FR20 enhancement)

**Prerequisites:** Story 3.6

**Technical Notes:**
- ASCII board display provides clear visual representation
- Board renderer is pure function (no side effects, easy to test)
- Initial board display confirms game connection and setup
- Row/column labels help users understand coordinate system

---

### Story 3.8: CLI Client - User Input Handling with Validation

As a player,
I want to input moves with validation and retry on errors,
So that I can make moves easily even if I make input mistakes.

**Acceptance Criteria:**

**Given** it's the player's turn
**When** client prompts for move input
**Then** client:
- Shows prompt: "Your turn (X): Enter move (row col): "
- Accepts input formats: "1 1", "1,1", "1, 1" (flexible parsing)
- Validates input before sending:
  - Both row and col provided
  - Values are numbers (0, 1, or 2)
  - Values are within bounds (0-2)

**And** if input is invalid:
- Shows clear error: "Invalid input. Please enter row and column (0-2), e.g., '1 1'"
- Prompts again (allows retry)
- Does NOT send message to server

**And** if input is valid:
- Converts to numbers: "1 1" → row: 1, col: 1
- Sends `{ type: 'move', gameCode: string, row: 1, col: 1 }` to server

**And** `packages/client/src/presentation/cli/InputHandler.ts` implements:
- `parseInput(input: string): { row: number, col: number } | null`
- `validateInput(row: number, col: number): boolean`
- `promptForMove(): Promise<{ row: number, col: number }>`

**Prerequisites:** Story 3.7

**Technical Notes:**
- Input validation prevents invalid moves from being sent
- Flexible parsing improves user experience
- Retry on error provides tolerance for mistakes (FR21 enhancement)
- Client-side validation reduces server load and improves UX

---

### Story 3.9: CLI Client - Turn-Based Input Control

As a player,
I want input to be disabled when it's not my turn,
So that I don't accidentally try to move out of turn.

**Acceptance Criteria:**

**Given** it's NOT the player's turn (currentPlayer ≠ playerSymbol)
**When** user tries to input a move
**Then** client:
- Ignores user input (does not prompt for move)
- Shows status message: "Waiting for opponent's move..."
- Does NOT send move message to server

**Given** it IS the player's turn (currentPlayer === playerSymbol)
**When** user inputs a move
**Then** client:
- Accepts input and prompts for move
- Validates and sends move message

**And** turn state is tracked in client:
- Stores `currentPlayer` from server messages
- Stores `playerSymbol` from `joined` message
- Compares before accepting input: `if (currentPlayer === playerSymbol) { acceptInput() }`

**Prerequisites:** Story 3.8

**Technical Notes:**
- Client-side turn validation prevents unnecessary server requests (FR6 enhancement)
- Input blocking provides clear UX feedback
- Turn state tracking enables reactive UI behavior
- Server still validates (client validation is UX only)

---

### Story 3.10: CLI Client - Real-Time Board Updates

As a player,
I want to see board updates immediately after moves,
So that I can see the current game state in real-time.

**Acceptance Criteria:**

**Given** a client receives `update` message from server
**When** message includes `board: BoardDTO` (updated board state)
**Then** client:
- Clears previous board display (or overwrites)
- Renders new board using `BoardRenderer.renderBoard()`
- Displays updated board with current state
- Shows current player: "Current player: X" or "Current player: O"

**Given** client receives `update` message after own move
**When** move was valid
**Then** client displays updated board showing own move

**Given** client receives `update` message after opponent move
**When** opponent made a move
**Then** client:
- Displays updated board showing opponent's move
- Updates turn status (now player's turn if currentPlayer matches)

**And** board updates happen automatically (no user action required)
**And** board display refreshes for every `update`, `win`, or `draw` message (FR22 enhancement)

**Prerequisites:** Stories 3.7, 3.9

**Technical Notes:**
- Real-time updates provide immediate feedback
- Board refresh happens automatically via WebSocket message handlers
- Both own and opponent moves trigger board updates
- Clear visual feedback improves game experience

---

### Story 3.11: CLI Client - Win/Draw Notifications

As a player,
I want to see clear notifications when the game ends,
So that I know if I won, lost, or drew.

**Acceptance Criteria:**

**Given** a client receives `win` message
**When** message includes `winner: PlayerSymbol`
**Then** client:
- Displays final board state
- Shows notification: "🎉 Game Over! Winner: X" or "😞 Game Over! Winner: O"
- Shows "You won!" if `winner === playerSymbol`
- Shows "You lost!" if `winner !== playerSymbol`
- Disables further input (game is finished)

**Given** a client receives `draw` message
**When** game ended in a tie
**Then** client:
- Displays final board state
- Shows notification: "🤝 Game Over! It's a draw!"
- Disables further input

**And** notifications are clearly visible and distinct from regular board updates

**Prerequisites:** Story 3.10

**Technical Notes:**
- Win/draw notifications provide clear game end feedback
- Final board state shows complete game result
- Input disabling prevents moves after game ends
- Clear messaging improves user experience

---

## Epic 4: Multi-Server Synchronization

**Goal:** Synchronize game state across multiple independent servers in real-time using Redis pub/sub.

### Story 4.1: Redis Integration Setup

As a developer,
I want Redis client integrated with the server,
So that I can store and retrieve game state across server instances.

**Acceptance Criteria:**

**Given** the server package exists (Story 1.4)
**When** I integrate Redis client
**Then** `packages/server/src/infrastructure/redis/redis.service.ts` exists with:
- `RedisService` class using `ioredis` library
- Connection to Redis server (host/port from environment variables)
- Methods: `get()`, `set()`, `hget()`, `hset()`, `hgetall()`, `publish()`, `subscribe()`
- Error handling for connection failures

**And** `packages/server/src/infrastructure/redis/redis.module.ts` exists and:
- Provides `RedisService` as injectable provider
- Configures Redis connection from environment variables
- Can be imported by other modules

**And** environment variables configured:
- `REDIS_HOST` (default: localhost)
- `REDIS_PORT` (default: 6379)
- `REDIS_PASSWORD` (optional)

**And** server can connect to Redis successfully

**Prerequisites:** Story 1.4

**Technical Notes:**
- Redis integration enables stateless server design
- ioredis provides TypeScript-friendly Redis client
- Connection configuration via environment variables enables Docker Compose setup
- Error handling ensures graceful degradation if Redis unavailable

---

### Story 4.2: Game State Storage in Redis

As a developer,
I want game state stored in Redis with proper structure,
So that multiple servers can access the same game data.

**Acceptance Criteria:**

**Given** a game is created or updated
**When** game state is saved
**Then** Redis stores game state as hash at key `game:{gameCode}` with fields:
- `board`: JSON string of BoardDTO (BoardCell[][])
- `currentPlayer`: 'X' or 'O'
- `status`: 'waiting' | 'playing' | 'finished'
- `winner`: 'X' | 'O' | null (as string or JSON)
- `players`: JSON string of `{ X?: string, O?: string }` (connection IDs)
- `createdAt`: ISO timestamp string
- `updatedAt`: ISO timestamp string

**And** game state has TTL: 3600 seconds (1 hour) for automatic cleanup

**And** `RedisGameRepository` implements `IGameRepository` interface:
- `create(game: Game): Promise<Game>`
- `findByCode(gameCode: string): Promise<Game | null>`
- `update(game: Game): Promise<Game>`

**And** repository converts between domain `Game` object and Redis hash format

**Prerequisites:** Story 4.1

**Technical Notes:**
- Redis hash structure enables efficient game state storage
- TTL prevents abandoned games from consuming resources
- Repository pattern abstracts storage implementation
- BoardDTO serialization enables JSON storage in Redis

---

### Story 4.3: Redis Pub/Sub for Server Synchronization

As a developer,
I want servers to publish game state updates via Redis pub/sub,
So that other servers are notified when game state changes.

**Acceptance Criteria:**

**Given** a server updates game state (after move, join, etc.)
**When** game state is saved to Redis
**Then** server publishes sync message to Redis channel `game:sync:{gameCode}` with:
- JSON payload containing game state update
- Message format: `{ gameCode: string, event: 'move' | 'join' | 'win' | 'draw', state: GameStateDTO }`

**And** `RedisService` implements:
- `publish(channel: string, message: string): Promise<void>`
- Publishes to Redis pub/sub channel

**And** publishing happens after every game state update:
- After game creation
- After player joins
- After move is made
- After win/draw detected

**Prerequisites:** Story 4.2

**Technical Notes:**
- Pub/sub enables real-time server-to-server communication
- Channel pattern `game:sync:{gameCode}` allows selective subscription
- Sync messages notify other servers of state changes
- JSON payload enables cross-server state synchronization

---

### Story 4.4: Server Subscription to Sync Channels

As a developer,
I want servers to subscribe to Redis sync channels,
So that they receive game state updates from other servers.

**Acceptance Criteria:**

**Given** a server starts up
**When** Redis connection is established
**Then** server subscribes to Redis pub/sub pattern:
- Pattern: `game:sync:*` (all game sync channels)
- Or: subscribe to specific channels as games are created/joined

**And** when sync message is received:
- Server parses JSON message
- Server reads updated game state from Redis (`game:{gameCode}`)
- Server updates local cache (if using cache)
- Server broadcasts update to connected clients for that game

**And** `RedisService` implements:
- `subscribe(channel: string, callback: (message: string) => void): Promise<void>`
- `unsubscribe(channel: string): Promise<void>`
- Message handler processes sync messages

**And** subscription handles:
- Multiple concurrent games
- Channel cleanup when games end
- Error handling for subscription failures

**Prerequisites:** Story 4.3

**Technical Notes:**
- Subscription enables real-time cross-server updates
- Pattern subscription (`game:sync:*`) simplifies channel management
- Message processing updates local state and notifies clients
- Error handling ensures robust synchronization

---

### Story 4.5: Cross-Server State Consistency

As a player,
I want moves made on one server to appear on clients connected to other servers,
So that real-time synchronization works correctly.

**Acceptance Criteria:**

**Given** Player X connected to Server A, Player O connected to Server B
**When** Player X makes a move on Server A
**Then**:
1. Server A processes move, updates Redis
2. Server A publishes sync message to `game:sync:{gameCode}`
3. Server B receives sync message via Redis pub/sub
4. Server B reads updated game state from Redis
5. Server B broadcasts `update` message to Player O (connected to Server B)
6. Player O sees the move immediately

**And** state consistency is maintained:
- Both servers have identical game state after sync
- Board state matches across servers
- Current player matches across servers
- Game status matches across servers

**And** synchronization latency is < 200ms (per NFR)

**Prerequisites:** Stories 4.3, 4.4

**Technical Notes:**
- Cross-server sync enables distributed architecture demonstration
- Redis pub/sub provides low-latency synchronization
- State consistency ensures fair gameplay
- Real-time updates provide seamless user experience

---

### Story 4.6: Synchronization Error Handling

As a developer,
I want robust error handling for synchronization failures,
So that the system degrades gracefully when Redis or network issues occur.

**Acceptance Criteria:**

**Given** Redis connection fails
**When** server tries to publish or subscribe
**Then** server:
- Logs error with context (gameCode, operation type)
- Attempts reconnection with exponential backoff
- Sends error to affected clients if critical operation fails
- Continues operating for local operations if possible

**Given** sync message fails to deliver
**When** pub/sub message is lost or corrupted
**Then** server:
- Logs warning about sync failure
- Optionally: implements retry mechanism or state reconciliation
- Notifies clients of potential state inconsistency (if critical)

**And** error handling covers:
- Redis connection failures
- Pub/sub subscription failures
- Message parsing errors
- State read/write failures

**Prerequisites:** Stories 4.4, 4.5

**Technical Notes:**
- Error handling ensures system resilience
- Graceful degradation maintains user experience when possible
- Logging enables debugging of sync issues
- Error recovery mechanisms prevent complete system failure

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | Create game session | Epic 2 | Story 2.3 |
| FR2 | Join game (with restriction) | Epic 2 | Story 2.4 |
| FR3 | Track player assignment | Epic 2 | Story 2.4 |
| FR4 | Manage game state | Epic 3 | Story 3.3 |
| FR5 | Multiple concurrent games | Epic 2 | Story 2.3 |
| FR6 | Submit moves (with client validation) | Epic 3 | Stories 3.3, 3.9 |
| FR7 | Validate moves | Epic 3 | Story 3.2 |
| FR8 | Reject invalid moves | Epic 3 | Story 3.2 |
| FR9 | Update game state | Epic 3 | Story 3.3 |
| FR10 | Enforce turn order | Epic 3 | Story 3.3 |
| FR11 | Detect wins | Epic 3 | Story 3.4 |
| FR12 | Detect draws | Epic 3 | Story 3.5 |
| FR13 | Notify game end | Epic 3 | Stories 3.4, 3.5, 3.11 |
| FR14 | Sync between servers | Epic 4 | Story 4.5 |
| FR15 | Real-time move reflection | Epic 4 | Story 4.5 |
| FR16 | Consistent state | Epic 4 | Story 4.5 |
| FR17 | Propagate updates | Epic 4 | Story 4.5 |
| FR18 | Connect to Server A | Epic 2 | Story 2.1 |
| FR19 | Connect to Server B | Epic 2 | Story 2.1 |
| FR20 | Display board (with initial state) | Epic 3 | Story 3.7 |
| FR21 | Accept input (with tolerance) | Epic 3 | Story 3.8 |
| FR22 | Real-time updates (after every move) | Epic 3 | Story 3.10 |
| FR23 | Status messages | Epic 3 | Story 3.9 |
| FR24 | Win/draw notifications | Epic 3 | Story 3.11 |
| FR25 | WebSocket communication | Epic 2 | Story 2.1 |
| FR26 | JSON messages | Epic 2 | Story 2.5 |
| FR27 | Message types (with board state) | Epic 2 | Story 2.5 |
| FR28 | Validate messages | Epic 2 | Story 2.6 |
| FR29 | Error messages | Epic 2 | Story 2.6 |
| FR30 | Connection error handling | Epic 2 | Story 2.7 |
| FR31 | Invalid game code errors | Epic 2 | Story 2.4 |
| FR32 | Sync error handling | Epic 4 | Story 4.6 |

**Validation:** All 32 FRs are covered across 4 epics and 24 stories.

---

## Summary

This epic breakdown decomposes the fusion-tic-tac-toe requirements into 4 epics and 24 implementable stories. Each story is sized for single dev agent completion and includes detailed BDD acceptance criteria, prerequisites, and technical notes.

**Epic 1 (Foundation):** 7 stories establishing project infrastructure
**Epic 2 (Game Session Management):** 7 stories enabling game creation and joining
**Epic 3 (Core Gameplay):** 11 stories implementing complete Tic-Tac-Toe gameplay
**Epic 4 (Multi-Server Synchronization):** 6 stories enabling real-time cross-server sync

All functional requirements are mapped to specific stories, ensuring complete coverage of the product vision.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and technical decisions._

