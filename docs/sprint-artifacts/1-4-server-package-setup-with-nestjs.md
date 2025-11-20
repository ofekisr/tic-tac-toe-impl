# Story 1.4: Server Package Setup with NestJS

Status: done

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

- [x] Task 1: Configure server package.json (AC: #1)
  - [x] Create `packages/server/package.json`
  - [x] Add dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-ws`, `@nestjs/websockets`, `ioredis`
  - [x] Add dev dependencies: `typescript`, `@types/node`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `@nestjs/testing`, `ts-jest`
  - [x] Add build script: `"build": "tsc"`
  - [x] Add start script: `"start": "node dist/main.js"`
  - [x] Add dev script: `"dev": "nodemon --exec ts-node src/main.ts"`
  - [x] Add test script: `"test": "jest"`
  - [x] Test: Verify package.json is valid and dependencies install correctly

- [x] Task 2: Create directory structure (AC: #2)
  - [x] Create `packages/server/src/domain/` directory
  - [x] Create `packages/server/src/domain/entities/` subdirectory
  - [x] Create `packages/server/src/domain/interfaces/` subdirectory
  - [x] Create `packages/server/src/domain/value-objects/` subdirectory
  - [x] Create `packages/server/src/application/` directory
  - [x] Create `packages/server/src/application/services/` subdirectory
  - [x] Create `packages/server/src/application/use-cases/` subdirectory
  - [x] Create `packages/server/src/infrastructure/` directory
  - [x] Create `packages/server/src/infrastructure/redis/` subdirectory
  - [x] Create `packages/server/src/presentation/` directory
  - [x] Create `packages/server/src/presentation/game/` subdirectory
  - [x] Test: Verify all directories exist

- [x] Task 3: Create minimal NestJS application (AC: #3)
  - [x] Create `packages/server/src/main.ts`
  - [x] Import NestJS bootstrap function
  - [x] Create minimal AppModule class
  - [x] Bootstrap NestJS application
  - [x] Configure port from environment variable (default 3001)
  - [x] Test: Run `npm run dev` and verify server starts without errors
  - [x] Test: Verify server listens on configured port

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

- **Task 1 Complete**: Configured `package.json` with all required NestJS dependencies (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-ws`, `@nestjs/websockets`), Redis client (`ioredis`), and dev dependencies (TypeScript tooling, Jest testing framework). Added scripts for build, start, dev (with nodemon), and test. Dependencies installed successfully with no vulnerabilities.

- **Task 2 Complete**: Created complete layered architecture directory structure matching architecture specification:
  - Domain layer: `domain/entities/`, `domain/interfaces/`, `domain/value-objects/`
  - Application layer: `application/services/`, `application/use-cases/`
  - Infrastructure layer: `infrastructure/redis/`
  - Presentation layer: `presentation/game/`
  All directories verified to exist.

- **Task 3 Complete**: Created minimal NestJS application with `main.ts` bootstrap file and `AppModule` class. Application configured to listen on port 3001 (configurable via PORT environment variable). Build succeeds, code compiles without errors, and application structure follows NestJS patterns.

### File List

- `packages/server/package.json` (modified - added dependencies and scripts)
- `packages/server/src/main.ts` (created - NestJS bootstrap)
- `packages/server/src/presentation/app.module.ts` (created - root module)
- `packages/server/src/index.ts` (deleted - replaced by main.ts)
- `packages/server/src/domain/` (created - directory structure)
- `packages/server/src/domain/entities/` (created)
- `packages/server/src/domain/interfaces/` (created)
- `packages/server/src/domain/value-objects/` (created)
- `packages/server/src/application/` (created)
- `packages/server/src/application/services/` (created)
- `packages/server/src/application/use-cases/` (created)
- `packages/server/src/infrastructure/` (created)
- `packages/server/src/infrastructure/redis/` (created)
- `packages/server/src/presentation/` (created)
- `packages/server/src/presentation/game/` (created)

