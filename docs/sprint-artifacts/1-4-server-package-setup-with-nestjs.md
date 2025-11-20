# Story 1.4: Server Package Setup with NestJS

Status: drafted

## Story

As a developer,
I want the server package configured with NestJS and TypeScript,
So that I can build the WebSocket server with dependency injection and clean architecture.

## Acceptance Criteria

1. **Given** the `packages/server/` directory exists (Story 1.1)
   **When** I set up the server package
   **Then** `packages/server/package.json` includes:
   - Dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-ws`, `@nestjs/websockets`, `ioredis`
   - Dev dependencies: `typescript`, `@types/node`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `@nestjs/testing`, `ts-jest`
   - Scripts: `"build"`, `"start"`, `"dev"` (with nodemon), `"test"`

2. **And** `packages/server/src/` directory structure includes:
   - `domain/` directory for domain layer (entities, interfaces, value objects)
   - `application/` directory for application layer (services, use cases)
   - `infrastructure/` directory for infrastructure layer (Redis, WebSocket implementations)
   - `presentation/` directory for presentation layer (Gateways, Controllers)
   - `main.ts` for application bootstrap

3. **And** `packages/server/src/main.ts` can be executed and starts a NestJS application (even if minimal)

## Tasks / Subtasks

- [ ] Task 1: Configure server package.json (AC: #1)
  - [ ] Create `packages/server/package.json`
  - [ ] Add dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-ws`, `@nestjs/websockets`, `ioredis`
  - [ ] Add dev dependencies: `typescript`, `@types/node`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `@nestjs/testing`, `ts-jest`
  - [ ] Add build script: `"build": "tsc"`
  - [ ] Add start script: `"start": "node dist/main.js"`
  - [ ] Add dev script: `"dev": "nodemon --exec ts-node src/main.ts"`
  - [ ] Add test script: `"test": "jest"`
  - [ ] Test: Verify package.json is valid and dependencies install correctly

- [ ] Task 2: Create directory structure (AC: #2)
  - [ ] Create `packages/server/src/domain/` directory
  - [ ] Create `packages/server/src/domain/entities/` subdirectory
  - [ ] Create `packages/server/src/domain/interfaces/` subdirectory
  - [ ] Create `packages/server/src/domain/value-objects/` subdirectory
  - [ ] Create `packages/server/src/application/` directory
  - [ ] Create `packages/server/src/application/services/` subdirectory
  - [ ] Create `packages/server/src/application/use-cases/` subdirectory
  - [ ] Create `packages/server/src/infrastructure/` directory
  - [ ] Create `packages/server/src/infrastructure/redis/` subdirectory
  - [ ] Create `packages/server/src/presentation/` directory
  - [ ] Create `packages/server/src/presentation/game/` subdirectory
  - [ ] Test: Verify all directories exist

- [ ] Task 3: Create minimal NestJS application (AC: #3)
  - [ ] Create `packages/server/src/main.ts`
  - [ ] Import NestJS bootstrap function
  - [ ] Create minimal AppModule class
  - [ ] Bootstrap NestJS application
  - [ ] Configure port from environment variable (default 3001)
  - [ ] Test: Run `npm run dev` and verify server starts without errors
  - [ ] Test: Verify server listens on configured port

## Dev Notes

### Architecture Patterns and Constraints

- **NestJS Framework**: Architecture mandates NestJS for server framework with TypeScript-first approach [Source: docs/architecture.md#Decision-Summary]
- **Layered Architecture**: Architecture specifies strict layered structure: domain, application, infrastructure, presentation [Source: docs/architecture.md#Project-Structure]
- **Dependency Injection**: NestJS DI enables interface-based design following SOLID/DIP principles [Source: docs/architecture.md#Technology-Stack-Details]
- **WebSocket Support**: NestJS provides WebSocket Gateway pattern via `@nestjs/websockets` [Source: docs/architecture.md#Technology-Stack-Details]

### Project Structure Notes

- Server package follows layered architecture pattern
- Domain layer has no dependencies (pure TypeScript)
- Application layer depends on domain interfaces
- Infrastructure layer implements domain interfaces
- Presentation layer depends on application services
- Directory structure matches architecture specification exactly

### Testing Standards

- NestJS provides testing utilities via `@nestjs/testing`
- Use `Test.createTestingModule()` for integration tests
- Mock dependencies using NestJS providers
- TDD workflow supported with Jest integration

### References

- [Source: docs/epics.md#Story-1.4-Server-Package-Setup-with-NestJS]
- [Source: docs/architecture.md#Project-Structure]
- [Source: docs/architecture.md#Technology-Stack-Details]
- [Source: docs/architecture.md#Dependency-Graph-&-Development-Order]
- [Source: docs/sprint-planning.md#Development-Principles]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

