# Story 1.5: Client Package Setup

Status: drafted

## Story

As a developer,
I want the client package configured with TypeScript and WebSocket client library,
So that I can build the CLI client interface.

## Acceptance Criteria

1. **Given** the `packages/client/` directory exists (Story 1.1)
   **When** I set up the client package
   **Then** `packages/client/package.json` includes:
   - Dependencies: `ws` (WebSocket client), `@fusion-tic-tac-toe/shared` (shared types)
   - Dev dependencies: `typescript`, `@types/node`, `@types/ws`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `ts-jest`
   - Scripts: `"build"`, `"start"`, `"dev"`, `"test"`

2. **And** `packages/client/src/` directory structure includes:
   - `domain/` directory (entities, interfaces)
   - `application/` directory (services, use cases)
   - `infrastructure/` directory (WebSocket client implementation, mocks)
   - `presentation/` directory (CLI interface, board renderer, input handler)

3. **And** client can import shared types from `@fusion-tic-tac-toe/shared`

## Tasks / Subtasks

- [ ] Task 1: Configure client package.json (AC: #1)
  - [ ] Create `packages/client/package.json`
  - [ ] Add dependencies: `ws`, `@fusion-tic-tac-toe/shared`
  - [ ] Add dev dependencies: `typescript`, `@types/node`, `@types/ws`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `ts-jest`
  - [ ] Add build script: `"build": "tsc"`
  - [ ] Add start script: `"start": "node dist/index.js"`
  - [ ] Add dev script: `"dev": "nodemon --exec ts-node src/index.ts"`
  - [ ] Add test script: `"test": "jest"`
  - [ ] Test: Verify package.json is valid and dependencies install correctly

- [ ] Task 2: Create directory structure (AC: #2)
  - [ ] Create `packages/client/src/domain/` directory
  - [ ] Create `packages/client/src/domain/entities/` subdirectory
  - [ ] Create `packages/client/src/domain/interfaces/` subdirectory
  - [ ] Create `packages/client/src/application/` directory
  - [ ] Create `packages/client/src/application/services/` subdirectory
  - [ ] Create `packages/client/src/application/use-cases/` subdirectory
  - [ ] Create `packages/client/src/infrastructure/` directory
  - [ ] Create `packages/client/src/infrastructure/websocket/` subdirectory
  - [ ] Create `packages/client/src/infrastructure/mocks/` subdirectory
  - [ ] Create `packages/client/src/presentation/` directory
  - [ ] Create `packages/client/src/presentation/cli/` subdirectory
  - [ ] Test: Verify all directories exist

- [ ] Task 3: Verify shared types import (AC: #3)
  - [ ] Create test file importing types from `@fusion-tic-tac-toe/shared`
  - [ ] Import `Board`, `Move`, `ClientMessage`, `ServerMessage` types
  - [ ] Verify TypeScript compilation succeeds
  - [ ] Test: Run `npm run build` and verify no import errors

## Dev Notes

### Architecture Patterns and Constraints

- **Shared Types**: Client must use shared types package for protocol compatibility [Source: docs/architecture.md#Parallel-Development-Architecture]
- **Layered Structure**: Client mirrors server architecture for consistency [Source: docs/architecture.md#CLI-Client-Architecture]
- **WebSocket Client**: Client uses `ws` library for WebSocket connections [Source: docs/architecture.md#Technology-Stack-Details]
- **Mock Server**: Mock server enables independent client development [Source: docs/architecture.md#Parallel-Development-Architecture]

### Project Structure Notes

- Client package follows same layered architecture as server
- Infrastructure layer contains WebSocket client implementation
- Presentation layer contains CLI interface components
- Mock server directory enables testing without real server

### Testing Standards

- Client tests can use mock server for integration testing
- Unit tests mock WebSocket client interface
- Test coverage target: 90%+ for application layer, 80%+ for infrastructure

### References

- [Source: docs/epics.md#Story-1.5-Client-Package-Setup]
- [Source: docs/architecture.md#CLI-Client-Architecture]
- [Source: docs/architecture.md#Parallel-Development-Architecture]
- [Source: docs/sprint-planning.md#Development-Principles]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

