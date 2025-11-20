# Integration Tests

Integration tests for client-server communication and multi-server synchronization.

## Prerequisites

- Redis must be running (use `docker-compose up -d redis`)
- Environment variables:
  - `REDIS_HOST=localhost` (default)
  - `REDIS_PORT=6379` (default)

## Running Tests

### Run all integration tests
```bash
npm run test:integration
```

### Run specific integration test file
```bash
npm run test:integration -- game-flow.integration.spec.ts
```

### Run with Redis cleanup
Integration tests automatically clean up Redis before each test, but you can manually clean:
```bash
redis-cli FLUSHDB
```

## Test Suites

### 1. Game Flow Integration Tests (`game-flow.integration.spec.ts`)

Tests end-to-end game flow:
- ✅ Create game
- ✅ Join game
- ✅ Make moves
- ✅ Win condition detection
- ✅ Draw condition detection
- ✅ Error scenarios (invalid moves, not player turn, cell occupied)
- ✅ Game not found errors

**Test Cases:**
- Complete game flow with win condition
- Complete game flow with draw condition
- Invalid move: not player's turn
- Invalid move: cell already occupied
- Joining non-existent game

### 2. Multi-Server Synchronization Tests (`multi-server-sync.integration.spec.ts`)

Tests cross-server synchronization:
- ✅ Move on Server A appears on Server B client
- ✅ State consistency across servers
- ✅ Real-time sync propagation

**Test Cases:**
- Sync move from Server A to Server B client
- Maintain state consistency across multiple moves

## Test Helpers

### `createClient(port: number): Promise<WebSocket>`
Creates a WebSocket client connection to the specified port.

### `sendAndWait(client: WebSocket, message: ClientMessage, timeout?: number): Promise<ServerMessage>`
Sends a message and waits for a single response.

### `waitForMessages(client: WebSocket, count: number, timeout?: number): Promise<ServerMessage[]>`
Waits for multiple messages from the server.

## Notes

- Integration tests use real WebSocket connections
- Tests use random ports to avoid conflicts
- Each test cleans up Redis before running
- Tests have longer timeouts (30 seconds) to account for network delays
- Multi-server tests require Redis pub/sub to be working

## Troubleshooting

**Tests fail with connection errors:**
- Ensure Redis is running: `docker-compose up -d redis`
- Check Redis connection: `redis-cli ping`

**Tests timeout:**
- Increase timeout in test file
- Check if Redis is responding
- Verify WebSocket server is starting correctly

**Port conflicts:**
- Tests use random ports (4000-5000 range)
- If conflicts occur, adjust port range in test files

