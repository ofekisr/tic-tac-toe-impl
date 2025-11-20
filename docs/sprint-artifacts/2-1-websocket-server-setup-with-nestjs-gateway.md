# Story 2.1: WebSocket Server Setup with NestJS Gateway

Status: drafted

## Story

As a developer,
I want a WebSocket server using NestJS Gateway,
So that clients can establish persistent connections for real-time communication.

## Acceptance Criteria

1. **Given** the server package is set up (Story 1.4)
   **When** I create the WebSocket Gateway
   **Then** `packages/server/src/presentation/game/game.gateway.ts` exists with:
   - `@WebSocketGateway()` decorator configured for port 3001 (or from environment)
   - `handleConnection()` method that logs new connections
   - `handleDisconnect()` method that logs disconnections
   - Basic WebSocket message handling structure

2. **And** `packages/server/src/presentation/game/game.module.ts` exists and:
   - Imports `WebSocketsModule` from `@nestjs/websockets`
   - Provides `GameGateway` as a provider
   - Can be imported by `AppModule`

3. **And** server starts successfully and accepts WebSocket connections on configured port

## Tasks / Subtasks

- [ ] Task 1: Create WebSocket Gateway class (AC: #1)
  - [ ] Create `packages/server/src/presentation/game/game.gateway.ts`
  - [ ] Import `WebSocketGateway`, `WebSocketServer`, `OnGatewayConnection`, `OnGatewayDisconnect` from `@nestjs/websockets`
  - [ ] Import `Server` from `socket.io` (or `ws` based on NestJS adapter)
  - [ ] Create `GameGateway` class implementing `OnGatewayConnection`, `OnGatewayDisconnect`
  - [ ] Add `@WebSocketGateway()` decorator with port configuration from environment variable (default 3001)
  - [ ] Implement `handleConnection(client: Socket)` method that logs connection with client ID
  - [ ] Implement `handleDisconnect(client: Socket)` method that logs disconnection with client ID
  - [ ] Add basic message handler structure (placeholder for future message handling)
  - [ ] Test: Verify gateway class compiles without errors
  - [ ] Test: Verify gateway can be instantiated

- [ ] Task 2: Create Game Module (AC: #2)
  - [ ] Create `packages/server/src/presentation/game/game.module.ts`
  - [ ] Import `Module` from `@nestjs/common`
  - [ ] Import `WebSocketsModule` from `@nestjs/websockets`
  - [ ] Import `GameGateway` from `./game.gateway`
  - [ ] Create `GameModule` class with `@Module()` decorator
  - [ ] Add `imports: [WebSocketsModule]` to module metadata
  - [ ] Add `providers: [GameGateway]` to module metadata
  - [ ] Test: Verify module compiles without errors
  - [ ] Test: Verify module can be imported by AppModule

- [ ] Task 3: Integrate Gateway with AppModule (AC: #2, #3)
  - [ ] Open `packages/server/src/presentation/app.module.ts` (or create if needed)
  - [ ] Import `GameModule` from `./game/game.module`
  - [ ] Add `GameModule` to `imports` array in `AppModule`
  - [ ] Update `main.ts` to ensure WebSocket adapter is configured
  - [ ] Test: Run `npm run dev` and verify server starts successfully
  - [ ] Test: Verify server accepts WebSocket connections on configured port
  - [ ] Test: Verify connection/disconnection events are logged

- [ ] Task 4: Fix Docker Runtime Issues (from Story 1.6)
  - [ ] Review Story 1.6 completion notes and Docker configuration
  - [ ] Run `docker-compose up --build` to test Docker Compose startup
  - [ ] Verify `app1` service (Server A) starts successfully on port 3001
  - [ ] Verify `app2` service (Server B) starts successfully on port 3002
  - [ ] Verify `redis` service starts successfully on port 6379
  - [ ] Test: Verify WebSocket Gateway accepts connections when server runs in Docker
  - [ ] Test: Verify environment variables (SERVER_PORT, SERVER_ID) are correctly passed to container
  - [ ] Fix any Docker runtime issues (port conflicts, build errors, dependency issues)
  - [ ] Test: Verify `docker-compose down` cleans up services correctly
  - [ ] Document any Docker-specific configuration or fixes needed

- [ ] Task 5: Integration Tests with Client-Server Stubbing (AC: #3)
  - [ ] Create `packages/server/src/presentation/game/game.gateway.spec.ts` for integration tests
  - [ ] Set up NestJS testing module with `Test.createTestingModule()`
  - [ ] Create WebSocket test client using `socket.io-client` or `ws` library
  - [ ] Implement integration test: "should accept WebSocket connection"
    - [ ] Connect test client to Gateway
    - [ ] Verify connection event is received
    - [ ] Verify `handleConnection()` is called and logs connection
  - [ ] Implement integration test: "should handle WebSocket disconnection"
    - [ ] Connect test client
    - [ ] Disconnect test client
    - [ ] Verify `handleDisconnect()` is called and logs disconnection
  - [ ] Implement integration test: "should accept connections on configured port"
    - [ ] Test with default port (3001)
    - [ ] Test with environment variable port (SERVER_PORT)
    - [ ] Verify port configuration works correctly
  - [ ] Use stubbing/mocking for:
    - [ ] WebSocket client connection (if needed for isolated testing)
    - [ ] Logger service (if logging is abstracted)
    - [ ] External dependencies (avoid real Redis/DB connections in unit tests)
  - [ ] Test: Run integration tests and verify all pass
  - [ ] Test: Verify tests work both with local server and Docker containerized server

## Dev Notes

### Learnings from Previous Story

**From Story 1.4 (Status: done)**

- **Server Package Setup**: NestJS server package configured with TypeScript, dependencies installed, directory structure created [Source: docs/sprint-artifacts/1-4-server-package-setup-with-nestjs.md]
- **Directory Structure**: Layered architecture structure exists: `domain/`, `application/`, `infrastructure/`, `presentation/` [Source: docs/sprint-artifacts/1-4-server-package-setup-with-nestjs.md]
- **NestJS Configuration**: NestJS application bootstrap exists in `main.ts` [Source: docs/sprint-artifacts/1-4-server-package-setup-with-nestjs.md]
- **Use Existing Structure**: Gateway should be created in `presentation/game/` directory following established patterns

**From Story 1.6 (Status: review)**

- **Docker Configuration**: Docker Compose configuration exists with services: redis, app1, app2, nginx [Source: docs/sprint-artifacts/1-6-docker-compose-configuration.md]
- **Dockerfile**: Server Dockerfile created with multi-stage build [Source: docs/sprint-artifacts/1-6-docker-compose-configuration.md]
- **Runtime Testing Pending**: Docker runtime testing deferred (requires Docker daemon) [Source: docs/sprint-artifacts/1-6-docker-compose-configuration.md]
- **Fix Required**: Story 2.1 should complete Docker runtime testing and fix any issues found

### Architecture Patterns and Constraints

- **NestJS Gateway Pattern**: Architecture mandates NestJS Gateway pattern for WebSocket handling [Source: docs/architecture.md#Technology-Stack-Details]
- **WebSocket Support**: NestJS provides WebSocket Gateway via `@nestjs/websockets` with Gateway pattern [Source: docs/architecture.md#Technology-Stack-Details]
- **Port Configuration**: Server ports configured via environment variables (3001 for Server A, 3002 for Server B) [Source: docs/architecture.md#Integration-Points]
- **Layered Architecture**: Gateway belongs in presentation layer, depends on application services [Source: docs/architecture.md#Project-Structure]
- **Connection Lifecycle**: Gateway handles connection lifecycle automatically via `OnGatewayConnection` and `OnGatewayDisconnect` interfaces [Source: docs/architecture.md#Technology-Stack-Details]

### Project Structure Notes

- Gateway file location: `packages/server/src/presentation/game/game.gateway.ts`
- Module file location: `packages/server/src/presentation/game/game.module.ts`
- Gateway follows NestJS decorator pattern with `@WebSocketGateway()`
- Connection tracking will be needed for game session management (future stories)
- Port configuration from environment enables multiple server instances

### Testing Standards

- Use NestJS testing utilities: `Test.createTestingModule()` for integration tests [Source: docs/architecture.md#Technology-Stack-Details]
- Mock WebSocket connections using test clients (socket.io-client or ws library)
- Test connection/disconnection handlers
- Gateway tests should verify decorator configuration and lifecycle methods
- Integration tests should verify WebSocket connections work end-to-end
- Use stubbing for external dependencies (avoid real Redis/DB in unit tests)
- Docker integration tests verify server works in containerized environment
- TDD approach: Write tests first, then implement gateway

### References

- [Source: docs/epics.md#Story-2.1-WebSocket-Server-Setup-with-NestJS-Gateway]
- [Source: docs/architecture.md#Technology-Stack-Details]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#NestJS-Patterns-Used]
- [Source: docs/prd.md#WebSocket-Message-Protocol]
- [Source: docs/sprint-planning.md#Development-Principles]
- [Source: docs/sprint-artifacts/1-6-docker-compose-configuration.md#Docker-Runtime-Testing]

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

