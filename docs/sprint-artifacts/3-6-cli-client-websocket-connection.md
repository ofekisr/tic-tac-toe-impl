# Story 3.6: CLI Client - WebSocket Connection

Status: drafted

## Story

As a player,
I want to connect to the game server via WebSocket,
So that I can participate in games.

## Acceptance Criteria

1. **Given** the client package is set up (Story 1.5)
   **When** I start the CLI client
   **Then** client:
   - Prompts for server URL (defaults to `ws://localhost:3001` or `ws://localhost:3002`)
   - Establishes WebSocket connection using `ws` library
   - Handles connection events: `open`, `error`, `close`
   - Shows connection status to user ("Connecting...", "Connected", "Disconnected")

2. **And** `packages/client/src/infrastructure/websocket/WebSocketClient.ts` implements:
   - `connect(url: string): Promise<void>`
   - `disconnect(): Promise<void>`
   - `send(message: ClientMessage): void`
   - `onMessage(handler: (message: ServerMessage) => void): void`
   - `onError(handler: (error: Error) => void): void`
   - `onClose(handler: () => void): void`
   - `isConnected(): boolean`

3. **And** client can connect to Server A (port 3001) or Server B (port 3002)

## Tasks / Subtasks

- [ ] Task 1: Create WebSocketClient class (AC: #2)
  - [ ] Create `packages/client/src/infrastructure/websocket/WebSocketClient.ts`
  - [ ] Import `ws` library and shared message types
  - [ ] Implement `connect(url: string): Promise<void>`
  - [ ] Implement `disconnect(): Promise<void>`
  - [ ] Implement `send(message: ClientMessage): void`
  - [ ] Implement `onMessage(handler: (message: ServerMessage) => void): void`
  - [ ] Implement `onError(handler: (error: Error) => void): void`
  - [ ] Implement `onClose(handler: () => void): void`
  - [ ] Implement `isConnected(): boolean`
  - [ ] Handle WebSocket events: `open`, `error`, `close`, `message`
  - [ ] Parse incoming JSON messages to ServerMessage types
  - [ ] Keep client < 150 lines
  - [ ] Test: Write `WebSocketClient.test.ts` FIRST with AAA pattern
  - [ ] Test: Mock ws library
  - [ ] Test: Verify connect() establishes connection
  - [ ] Test: Verify disconnect() closes connection
  - [ ] Test: Verify send() sends messages
  - [ ] Test: Verify onMessage() handlers are called
  - [ ] Test: Verify connection error handling

- [ ] Task 2: Create CLI entry point (AC: #1)
  - [ ] Create `packages/client/src/main.ts` or `packages/client/src/index.ts`
  - [ ] Prompt for server URL (with default: `ws://localhost:3001`)
  - [ ] Create WebSocketClient instance
  - [ ] Call `connect()` with provided URL
  - [ ] Show connection status messages
  - [ ] Handle connection errors gracefully
  - [ ] Test: Verify CLI prompts for server URL
  - [ ] Test: Verify default URL is used if no input

- [ ] Task 3: Handle connection events (AC: #1)
  - [ ] Open `packages/client/src/infrastructure/websocket/WebSocketClient.ts`
  - [ ] Register `open` event handler: show "Connected" message
  - [ ] Register `error` event handler: show error message and call error handlers
  - [ ] Register `close` event handler: show "Disconnected" message and call close handlers
  - [ ] Register `message` event handler: parse JSON and call message handlers
  - [ ] Test: Verify connection events are handled correctly
  - [ ] Test: Verify status messages are displayed

- [ ] Task 4: Support both server ports (AC: #3)
  - [ ] Open `packages/client/src/main.ts`
  - [ ] Allow user to specify port 3001 (Server A) or 3002 (Server B)
  - [ ] Construct WebSocket URL from port: `ws://localhost:${port}`
  - [ ] Test: Verify connection to port 3001 works
  - [ ] Test: Verify connection to port 3002 works

## Dev Notes

### Learnings from Previous Story

**From Story 1.5 (Status: drafted)**

- **Client Package Setup**: Client package exists with ws dependency [Source: docs/sprint-artifacts/1-5-client-package-setup.md]
- **Shared Types**: Shared types package exists for message types [Source: docs/sprint-artifacts/1-3-shared-types-package-setup.md]
- **Use Existing**: Use ws library and shared message types

### Architecture Patterns and Constraints

- **Infrastructure Layer**: WebSocket client in infrastructure layer [Source: docs/architecture.md#Infrastructure-Layer]
- **Event Handlers**: Reactive UI updates via event handlers [Source: docs/epics.md#Story-3.6]
- **Connection Management**: Handles network issues gracefully [Source: docs/epics.md#Story-3.6]
- **Code Size**: Client < 150 lines [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### Project Structure Notes

- WebSocketClient: `packages/client/src/infrastructure/websocket/WebSocketClient.ts`
- CLI entry: `packages/client/src/main.ts` or `packages/client/src/index.ts`
- Tests: `packages/client/src/infrastructure/websocket/WebSocketClient.test.ts`
- Uses: ws library, shared message types

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Infrastructure Layer**: Unit tests with mocked ws library, 80%+ coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Mock ws**: Mock WebSocket library for testing

### References

- [Source: docs/epics.md#Story-3.6-CLI-Client---WebSocket-Connection]
- [Source: docs/sprint-planning.md#Sprint-7-CLI-Client-Epic-3---Client-Side]
- [Source: docs/architecture.md#Infrastructure-Layer]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2025-11-20: Story created from Epic 3 breakdown

