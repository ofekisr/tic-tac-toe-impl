# Story 3.1: Domain Layer - Board and Move Value Objects

Status: drafted

## Story

As a developer,
I want Board and Move value objects in the domain layer,
So that game logic is pure and testable without external dependencies.

## Acceptance Criteria

1. **Given** the domain layer structure exists
   **When** I create Board value object
   **Then** `packages/shared/src/types/game.ts` includes:
   - `Board` class with private `cells: BoardCell[][]`
   - Constructor that creates empty 3x3 board or validates provided cells
   - Methods: `getCell(row, col)`, `setCell(row, col, value)`, `isEmpty(row, col)`, `isFull()`, `toArray()`
   - Validation: ensures 3x3 size, validates positions (0-2 range)
   - Static method: `Board.fromArray(cells: BoardCell[][])`

2. **And** `packages/shared/src/types/game.ts` includes `Move` class:
   - `Move` class with `row`, `col`, `player`, `timestamp` properties
   - Constructor validates position (0-2 range)
   - Methods: `toPosition()`, `equals(other: Move)`

3. **And** both classes have no external dependencies (pure TypeScript)

## Tasks / Subtasks

- [ ] Task 1: Create Board value object (AC: #1)
  - [ ] Open `packages/shared/src/types/game.ts`
  - [ ] Define `BoardCell` type: `'' | 'X' | 'O'`
  - [ ] Create `Board` class with private `cells: BoardCell[][]`
  - [ ] Implement constructor: creates empty 3x3 board by default
  - [ ] Implement constructor overload: validates provided cells (must be 3x3)
  - [ ] Implement `getCell(row: number, col: number): BoardCell`
  - [ ] Implement `setCell(row: number, col: number, value: BoardCell): void`
  - [ ] Implement `isEmpty(row: number, col: number): boolean`
  - [ ] Implement `isFull(): boolean`
  - [ ] Implement `toArray(): BoardCell[][]`
  - [ ] Implement static `fromArray(cells: BoardCell[][]): Board`
  - [ ] Add validation: ensures 3x3 size
  - [ ] Add validation: validates positions (0-2 range)
  - [ ] Test: Write `Board.test.ts` with AAA pattern
  - [ ] Test: Verify empty board creation
  - [ ] Test: Verify getCell/setCell operations
  - [ ] Test: Verify isEmpty/isFull methods
  - [ ] Test: Verify position validation (throws on out of bounds)
  - [ ] Test: Verify size validation (throws on non-3x3)

- [ ] Task 2: Create Move value object (AC: #2)
  - [ ] Open `packages/shared/src/types/game.ts`
  - [ ] Create `Move` class with properties: `row`, `col`, `player`, `timestamp`
  - [ ] Implement constructor: validates position (0-2 range)
  - [ ] Implement `toPosition(): { row: number, col: number }`
  - [ ] Implement `equals(other: Move): boolean`
  - [ ] Add validation: throws error if row/col out of bounds
  - [ ] Test: Write `Move.test.ts` with AAA pattern
  - [ ] Test: Verify Move creation with valid positions
  - [ ] Test: Verify Move validation (throws on invalid positions)
  - [ ] Test: Verify toPosition() returns correct values
  - [ ] Test: Verify equals() method works correctly

- [ ] Task 3: Create BoardMapper utility (AC: #1)
  - [ ] Open `packages/shared/src/types/game.ts`
  - [ ] Create `BoardMapper` class for DTO conversion
  - [ ] Implement `toDTO(board: Board): BoardDTO` (BoardCell[][])
  - [ ] Implement `fromDTO(dto: BoardDTO): Board`
  - [ ] Test: Write `BoardMapper.test.ts`
  - [ ] Test: Verify DTO conversion works correctly

- [ ] Task 4: Export types and classes (AC: #1, #2)
  - [ ] Open `packages/shared/src/types/game.ts`
  - [ ] Export `Board`, `Move`, `BoardCell`, `BoardDTO`, `BoardMapper`
  - [ ] Update `packages/shared/src/types/index.ts` to export game types
  - [ ] Test: Verify types can be imported by other packages

## Dev Notes

### Architecture Patterns and Constraints

- **Domain Layer**: Pure domain objects with no external dependencies [Source: docs/epics.md#Story-3.1]
- **Value Objects**: Board and Move are value objects encapsulating game rules [Source: docs/epics.md#Story-3.1]
- **Shared Types**: Board and Move defined in shared package for use by both client and server [Source: docs/epics.md#Story-3.1]
- **Pure Functions**: All methods are pure (no side effects) for easy testing [Source: docs/epics.md#Story-3.1]
- **Code Size**: Board class < 150 lines, Move class < 100 lines, BoardMapper < 50 lines [Source: docs/sprint-planning.md#Sprint-1-Domain-Layer]

### Project Structure Notes

- Board and Move classes: `packages/shared/src/types/game.ts`
- BoardDTO type: `BoardCell[][]` (array of arrays)
- BoardCell type: `'' | 'X' | 'O'`
- Tests: `packages/shared/src/types/game.test.ts`
- Domain layer enables all other work (no dependencies)

### Testing Standards

- **TDD Approach**: Write tests FIRST before implementation [Source: docs/sprint-planning.md#TDD-Approach]
- **AAA Pattern**: Use Arrange-Act-Assert structure in tests [Source: docs/sprint-planning.md#TDD-Approach]
- **Domain Layer**: Pure unit tests (no mocks), 100% coverage [Source: docs/sprint-planning.md#Testing-Strategy-by-Layer]
- **Test File Size**: Can be up to 500 lines with clear AAA structure [Source: docs/sprint-planning.md#Code-Size-Guidelines]

### References

- [Source: docs/epics.md#Story-3.1-Domain-Layer---Board-and-Move-Value-Objects]
- [Source: docs/sprint-planning.md#Sprint-1-Domain-Layer]
- [Source: docs/architecture.md#Domain-Layer]

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

