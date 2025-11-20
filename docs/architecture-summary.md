# Architecture Summary: Flows, Components & Core Interfaces

## System Flows

### 1. Game Creation Flow

```
Client → Server: { type: 'join', gameCode: 'NEW' }
Server → Redis: Create game state with generated code
Server → Redis: Publish to channel 'game:sync:{gameCode}'
Server → Client: { type: 'joined', gameCode, board, status: 'waiting', playerSymbol: 'X' }
```

**Steps:**
1. Client requests new game (gameCode: 'NEW' or empty)
2. Server generates unique game code
3. Server creates game state in Redis (`game:{gameCode}`)
4. Server assigns player 'X' to client
5. Server sends confirmation with game code and initial state

### 2. Join Existing Game Flow

```
Client → Server: { type: 'join', gameCode: 'ABC123' }
Server → Redis: Check if game exists
Server → Redis: Assign player 'O' if available
Server → Redis: Update status to 'playing'
Server → Redis: Publish sync message
Server → Client: { type: 'joined', gameCode, board, status: 'playing', playerSymbol: 'O' }
Server → All Clients: { type: 'update', gameCode, board, currentPlayer, status: 'playing' }
```

**Steps:**
1. Client sends join request with game code
2. Server validates game exists and has space
3. Server assigns player 'O' to second client
4. Server updates game status to 'playing'
5. Server broadcasts update to all clients in game

### 3. Make Move Flow

```
Client → Server: { type: 'move', gameCode: 'ABC123', row: 1, col: 1 }
Server → Application: Validate move (turn, cell empty, game active)
Server → Redis: Update game state
Server → Application: Check win/draw conditions
Server → Redis: Publish sync message to 'game:sync:{gameCode}'
Server → All Clients: { type: 'update' | 'win' | 'draw', gameCode, board, ... }
```

**Steps:**
1. Client sends move with coordinates
2. Server validates move (current player's turn, cell empty, game active)
3. Server updates board state in Redis
4. Server checks for win/draw conditions
5. Server publishes sync message via Redis pub/sub
6. All servers receive sync and broadcast to their connected clients

### 4. Server-to-Server Synchronization Flow

```
Server A: Receives move from client
Server A → Redis: Update game state (game:{gameCode})
Server A → Redis: Publish sync message (game:sync:{gameCode})
Redis → Server B: Pub/sub notification
Server B → Redis: Read updated game state
Server B → Server B: Update local cache
Server B → Clients: Broadcast update to connected clients
```

**Steps:**
1. Server A processes move and updates Redis
2. Server A publishes sync message to Redis channel
3. Server B (subscribed to channel) receives notification
4. Server B reads updated state from Redis
5. Server B updates local cache
6. Server B broadcasts to its connected clients

### 5. WebSocket Connection Lifecycle

```
1. Client initiates WebSocket connection
2. Server accepts connection, assigns connection ID
3. Client sends 'join' message
4. Server validates and subscribes to Redis channel
5. Server sends 'joined' confirmation
6. [Gameplay: move messages exchanged]
7. Client disconnects OR game ends
8. Server cleans up connection, unsubscribes from Redis
```

## Components by Layer

### Domain Layer (Pure Business Logic)

**Entities:**
- `Game` - Game state entity (board, players, status, winner)
- `Player` - Player entity (symbol: X or O)
- `Move` - Move entity (position, player, timestamp)

**Value Objects:**
- `GameCode` - Unique game identifier
- `BoardPosition` - Row/column coordinates (0-2)

**Interfaces (Contracts):**
- `IGameRepository` - Game persistence contract
- `IGameStateService` - Game state management contract
- `IRedisClient` - Redis operations contract
- `IWebSocketHandler` - WebSocket handling contract

### Application Layer (Use Cases & Services)

**Services:**
- `GameService` - Game lifecycle management
- `MoveValidationService` - Move validation logic
- `GameStateService` - Game state operations

**Use Cases:**
- `CreateGameUseCase` - Create new game
- `JoinGameUseCase` - Join existing game
- `MakeMoveUseCase` - Process player move
- `SyncGameStateUseCase` - Synchronize state across servers

### Infrastructure Layer (External Integrations)

**Redis:**
- `RedisClient` - Redis connection and operations
- `RedisGameRepository` - Implements IGameRepository using Redis

**WebSocket:**
- `WebSocketServer` - WebSocket server setup
- `WebSocketHandler` - Implements IWebSocketHandler

**Configuration:**
- `EnvironmentConfig` - Environment variable management

### Presentation Layer (Request/Response Handling)

**Server:**
- `GameController` - HTTP endpoints (health checks)
- `WebSocketMessageHandler` - Handles incoming WebSocket messages

**Client:**
- `GameCLI` - Main CLI interface
- `BoardRenderer` - ASCII board display
- `InputHandler` - User input parsing

## Core Interfaces

### Server-Side Interfaces

#### IGameRepository
```typescript
interface IGameRepository {
  create(game: Game): Promise<Game>;
  findByCode(gameCode: string): Promise<Game | null>;
  update(game: Game): Promise<Game>;
  delete(gameCode: string): Promise<void>;
}
```

**Purpose:** Abstract game persistence
**Implementations:** `RedisGameRepository`

#### IGameStateService
```typescript
interface IGameStateService {
  createGame(): Promise<Game>;
  joinGame(gameCode: string, connectionId: string): Promise<Game>;
  makeMove(gameCode: string, move: Move): Promise<Game>;
  getGameState(gameCode: string): Promise<Game | null>;
  checkWinCondition(board: Board): PlayerSymbol | null;
  checkDrawCondition(board: Board): boolean;
}
```

**Purpose:** Game state operations and business rules
**Implementations:** Application service layer

**Note:** `makeMove` accepts a `Move` object instead of separate parameters. This encapsulation:
- Makes presentation changes easier (e.g., algebraic notation "a1" → Move)
- Enables move history tracking
- Improves testability and maintainability

#### IRedisClient
```typescript
interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<void>;
  hgetall(key: string): Promise<Record<string, string>>;
  publish(channel: string, message: string): Promise<void>;
  subscribe(channel: string, callback: (message: string) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}
```

**Purpose:** Abstract Redis operations
**Implementations:** `RedisClient` (ioredis wrapper)

#### IWebSocketHandler
```typescript
interface IWebSocketHandler {
  handleConnection(ws: WebSocket): void;
  handleMessage(ws: WebSocket, message: ClientMessage): void;
  handleDisconnection(ws: WebSocket): void;
  sendMessage(ws: WebSocket, message: ServerMessage): void;
  broadcastToGame(gameCode: string, message: ServerMessage): void;
}
```

**Purpose:** WebSocket connection and message handling
**Implementations:** `WebSocketHandler`

### Client-Side Interfaces

#### IWebSocketClient
```typescript
interface IWebSocketClient {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  send(message: ClientMessage): void;
  onMessage(handler: (message: ServerMessage) => void): void;
  onError(handler: (error: Error) => void): void;
  onClose(handler: () => void): void;
  isConnected(): boolean;
}
```

**Purpose:** Abstract WebSocket client operations
**Implementations:** `WebSocketClient` (ws client wrapper)

### Shared Types (packages/shared)

#### ClientMessage (Client → Server)
```typescript
type ClientMessage = 
  | { type: 'join'; gameCode: string }
  | { type: 'move'; gameCode: string; row: number; col: number };
```

#### ServerMessage (Server → Client)
```typescript
type ServerMessage =
  | { type: 'joined'; gameCode: string; board: BoardCell[][]; currentPlayer: PlayerSymbol; status: GameStatus; playerSymbol: PlayerSymbol }
  | { type: 'update'; gameCode: string; board: BoardCell[][]; currentPlayer: PlayerSymbol; status: 'playing' }
  | { type: 'win'; gameCode: string; board: BoardCell[][]; winner: PlayerSymbol }
  | { type: 'draw'; gameCode: string; board: BoardCell[][] }
  | { type: 'error'; code: ErrorCode; message: string; details?: unknown };
```

**Note:** WebSocket messages use `BoardCell[][]` for JSON serialization. Internally, code uses `Board` type:
- Server: Converts `Board` → `BoardCell[][]` using `board.toArray()` before sending
- Client: Converts `BoardCell[][]` → `Board` using `Board.fromArray()` after receiving

#### Board (Domain Value Object)
```typescript
class Board {
  private readonly cells: BoardCell[][];

  constructor(cells?: BoardCell[][]) {
    if (cells) {
      this.validateBoard(cells);
      this.cells = cells;
    } else {
      // Create empty 3x3 board
      this.cells = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    }
  }

  getCell(row: number, col: number): BoardCell {
    this.validatePosition(row, col);
    return this.cells[row][col];
  }

  setCell(row: number, col: number, value: BoardCell): void {
    this.validatePosition(row, col);
    this.cells[row][col] = value;
  }

  isEmpty(row: number, col: number): boolean {
    return this.getCell(row, col) === '';
  }

  toArray(): BoardCell[][] {
    // Return deep copy to prevent external mutation
    return this.cells.map(row => [...row]);
  }

  isFull(): boolean {
    return this.cells.every(row => row.every(cell => cell !== ''));
  }

  static fromArray(cells: BoardCell[][]): Board {
    return new Board(cells);
  }

  private validateBoard(cells: BoardCell[][]): void {
    if (cells.length !== 3) throw new Error('Board must be 3x3');
    for (const row of cells) {
      if (row.length !== 3) throw new Error('Board must be 3x3');
    }
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Position must be between 0 and 2');
    }
  }
}
```

#### BoardDTO (Data Transfer Object)
```typescript
// DTO for serialization and data transfer
export type BoardDTO = BoardCell[][];

// Mapper for conversion between Board and BoardDTO
export class BoardMapper {
  static toDTO(board: Board): BoardDTO {
    return board.toArray();
  }

  static fromDTO(dto: BoardDTO): Board {
    return Board.fromArray(dto);
  }
}
```

**Usage:**
- **Domain Logic**: Use `Board` (domain object with methods)
- **WebSocket Messages**: Use `BoardDTO` (serialized as `BoardCell[][]`)
- **Redis Storage**: Use `BoardDTO` (JSON serialization)
- **Conversion**: `BoardMapper.toDTO()` and `BoardMapper.fromDTO()`

#### Move (Value Object)
```typescript
class Move {
  constructor(
    public readonly row: number,      // 0-2
    public readonly col: number,      // 0-2
    public readonly player: PlayerSymbol, // 'X' or 'O'
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.row < 0 || this.row > 2 || this.col < 0 || this.col > 2) {
      throw new Error('Move position must be between 0 and 2');
    }
  }

  toPosition(): BoardPosition {
    return { row: this.row, col: this.col };
  }

  equals(other: Move): boolean {
    return this.row === other.row && this.col === other.col;
  }
}
```

#### GameState
```typescript
interface GameState {
  gameCode: string;
  board: Board;  // Board type (not BoardCell[][])
  currentPlayer: PlayerSymbol;
  status: 'waiting' | 'playing' | 'finished';
  winner: PlayerSymbol | null;
  players: {
    X?: string;
    O?: string;
  };
  moves: Move[];  // History of moves
  createdAt: Date;
  updatedAt: Date;
}
```

## Dependency Graph & Development Order

### Layer Dependency Flow

```
Presentation Layer
       ↓ (depends on)
Application Layer
       ↓ (depends on interfaces)
Domain Layer (interfaces)
       ↑ (implements)
Infrastructure Layer
```

### Development Order

**Phase 1: Domain (Foundation)**
1. Value Objects: `Board`, `Move`, `BoardPosition`
2. Entities: `Game`, `Player`
3. Interfaces: `IGameRepository`, `IGameStateService`, `IRedisClient`

**Phase 2: Application (Business Logic)**
4. Services: `MoveValidationService`, `GameStateService`, `GameService`
5. Use Cases: `CreateGameUseCase`, `JoinGameUseCase`, `MakeMoveUseCase`

**Phase 3: Infrastructure (External Systems)**
6. Redis: `RedisService`, `RedisGameRepository`

**Phase 4: Presentation (API Layer)**
7. Gateway: `GameGateway`, `GameController`

### Dependency Rules

**✅ Allowed:**
- Presentation → Application → Domain
- Infrastructure → Domain (implements interfaces)
- Application → Domain (uses interfaces)

**❌ Forbidden:**
- Domain → Any other layer
- Application → Infrastructure (direct, use interface)
- Presentation → Domain (bypass Application)
- Circular dependencies

## Component Interaction Diagram

```
┌─────────────┐
│   Client    │
│  (CLI App)  │
└──────┬──────┘
       │ WebSocket (JSON messages)
       │
┌──────▼──────────────────────────────────────┐
│         Presentation Layer                  │
│  ┌──────────────────────────────────────┐  │
│  │  GameGateway (WebSocket)             │  │
│  └──────────────┬───────────────────────┘  │
└─────────────────┼──────────────────────────┘
                  │ uses
┌─────────────────▼──────────────────────────┐
│         Application Layer                  │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ GameService │  │ MoveValidation    │  │
│  └──────┬──────┘  └────────┬──────────┘  │
│         │                  │              │
│  ┌──────▼──────────────────▼──────────┐  │
│  │     Use Cases                      │  │
│  │  CreateGame, JoinGame, MakeMove    │  │
│  └──────────────┬─────────────────────┘  │
└─────────────────┼─────────────────────────┘
                  │ depends on interfaces
┌─────────────────▼──────────────────────────┐
│         Domain Layer                        │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │    Game     │  │   Interfaces      │  │
│  │   Entity    │  │ IGameRepository   │  │
│  └──────────────┘  └────────┬──────────┘  │
└─────────────────────────────┼──────────────┘
                              │ implements
┌─────────────────────────────▼──────────────┐
│      Infrastructure Layer                  │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ RedisClient  │  │ WebSocketServer   │  │
│  │ RedisGame    │  │ WebSocketHandler  │  │
│  │ Repository   │  └──────────────────┘  │
│  └──────┬───────┘                         │
└─────────┼─────────────────────────────────┘
          │
    ┌─────▼─────┐      ┌──────────────┐
    │   Redis   │◄────►│  Server B    │
    │  (State   │      │  (via pub/   │
    │  Storage) │      │   sub)       │
    └───────────┘      └──────────────┘
```

## Key Design Principles

1. **Stateless Servers**: All state in Redis, servers are stateless
2. **Interface-Based Design**: All dependencies defined as interfaces
3. **Layered Architecture**: Domain → Application → Infrastructure → Presentation
4. **SOLID Principles**: Single responsibility, dependency inversion
5. **DRY**: Shared types package prevents duplication
6. **Contract-First**: Shared types define protocol before implementation

---

_Generated from Architecture Document_
_Date: 2025-01-27_

