# Story 1.7: Testing Framework Configuration

Status: drafted

## Story

As a developer,
I want Jest configured for all packages with TypeScript support,
So that I can write and run tests following TDD principles.

## Acceptance Criteria

1. **Given** all packages are set up (Stories 1.2, 1.4, 1.5)
   **When** I configure Jest
   **Then** each package has `jest.config.js` or Jest configuration in `package.json`:
   - TypeScript support via `ts-jest` preset
   - Test file pattern: `**/*.test.ts` or `**/*.spec.ts`
   - Coverage reporting enabled
   - Module path mapping configured if needed

2. **And** root-level test script runs tests for all packages: `npm test`

3. **And** I can write a simple test in any package and it executes successfully:
   ```typescript
   describe('Example', () => {
     it('should work', () => {
       expect(true).toBe(true);
     });
   });
   ```

## Tasks / Subtasks

- [ ] Task 1: Configure Jest for shared package (AC: #1)
  - [ ] Create `packages/shared/jest.config.js` or add to package.json
  - [ ] Configure `ts-jest` preset
  - [ ] Set test file pattern: `**/*.test.ts`
  - [ ] Enable coverage reporting
  - [ ] Test: Write simple test and verify it runs

- [ ] Task 2: Configure Jest for server package (AC: #1)
  - [ ] Create `packages/server/jest.config.js` or add to package.json
  - [ ] Configure `ts-jest` preset
  - [ ] Set test file pattern: `**/*.test.ts` or `**/*.spec.ts`
  - [ ] Enable coverage reporting
  - [ ] Configure module path mapping if needed
  - [ ] Configure NestJS testing module support
  - [ ] Test: Write simple test and verify it runs

- [ ] Task 3: Configure Jest for client package (AC: #1)
  - [ ] Create `packages/client/jest.config.js` or add to package.json
  - [ ] Configure `ts-jest` preset
  - [ ] Set test file pattern: `**/*.test.ts` or `**/*.spec.ts`
  - [ ] Enable coverage reporting
  - [ ] Configure module path mapping if needed
  - [ ] Test: Write simple test and verify it runs

- [ ] Task 4: Configure root-level test script (AC: #2)
  - [ ] Update root `package.json`
  - [ ] Add test script: `"test": "npm run test --workspaces"`
  - [ ] Test: Run `npm test` from root and verify all package tests run

- [ ] Task 5: Verify test execution (AC: #3)
  - [ ] Create example test in shared package
  - [ ] Create example test in server package
  - [ ] Create example test in client package
  - [ ] Run tests for each package individually
  - [ ] Run root-level test script
  - [ ] Test: Verify all tests pass

## Dev Notes

### Architecture Patterns and Constraints

- **Jest Framework**: Architecture mandates Jest as testing framework with TypeScript support [Source: docs/architecture.md#Decision-Summary]
- **TDD Approach**: Development principles require TDD workflow with tests written first [Source: docs/sprint-planning.md#Development-Principles]
- **Coverage Targets**: Domain layer 100%, Application layer 90%+, Infrastructure layer 80%+ [Source: docs/sprint-planning.md#Development-Principles]
- **NestJS Testing**: NestJS provides testing utilities via `@nestjs/testing` [Source: docs/architecture.md#Technology-Stack-Details]

### Project Structure Notes

- Each package has its own Jest configuration
- Root-level test script runs all package tests
- Test files follow naming convention: `*.test.ts` or `*.spec.ts`
- Coverage reports generated per package

### Testing Standards

- Use AAA (Arrange-Act-Assert) pattern for test structure
- Test files can be longer than production code (up to 500 lines acceptable)
- Clear separation between Arrange, Act, Assert sections improves readability
- Coverage reporting helps ensure test quality

### References

- [Source: docs/epics.md#Story-1.7-Testing-Framework-Configuration]
- [Source: docs/architecture.md#Decision-Summary]
- [Source: docs/sprint-planning.md#Development-Principles]
- [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

