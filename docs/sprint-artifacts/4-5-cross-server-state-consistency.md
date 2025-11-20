# Story 4.5: Cross-Server State Consistency

Status: todo

## Story

As a player,
I want moves made on one server to appear on clients connected to other servers,
So that real-time synchronization works correctly.

## Acceptance Criteria

1. **Given** Player X connected to Server A, Player O connected to Server B
   **When** Player X makes a move on Server A
   **Then**:
   - Server A processes move, updates Redis
   - Server A publishes sync message to `game:sync:{gameCode}`
   - Server B receives sync message via Redis pub/sub
   - Server B reads updated game state from Redis
   - Server B broadcasts `update` message to Player O (connected to Server B)
   - Player O sees the move immediately

2. **And** state consistency is maintained:
   - Both servers have identical game state after sync
   - Board state matches across servers
   - Current player matches across servers
   - Game status matches across servers

3. **And** synchronization latency is < 200ms (per NFR)

## Tasks / Subtasks

- [ ] Task 1: End-to-end integration test setup (AC: #1)
  - [ ] Set up test environment with two server instances
  - [ ] Set up test clients connected to different servers
  - [ ] Test: Verify test setup works

- [ ] Task 2: Test move on Server A → Server B receives update (AC: #1)
  - [ ] Create test scenario: Player X on Server A, Player O on Server B
  - [ ] Player X makes move on Server A
  - [ ] Verify Server B receives sync message
  - [ ] Verify Server B reads updated state from Redis
  - [ ] Verify Server B broadcasts to Player O
  - [ ] Verify Player O sees the move
  - [ ] Test: Write integration test

- [ ] Task 3: Test state consistency verification (AC: #2)
  - [ ] After sync, compare game state on both servers
  - [ ] Verify board state matches
  - [ ] Verify currentPlayer matches
  - [ ] Verify status matches
  - [ ] Test: Add assertions to integration test

- [ ] Task 4: Test win condition sync (AC: #1, #2)
  - [ ] Create test scenario where move causes win
  - [ ] Verify win sync message published
  - [ ] Verify both servers receive win notification
  - [ ] Verify both clients receive win message
  - [ ] Test: Write integration test for win sync

- [ ] Task 5: Test draw condition sync (AC: #1, #2)
  - [ ] Create test scenario where move causes draw
  - [ ] Verify draw sync message published
  - [ ] Verify both servers receive draw notification
  - [ ] Verify both clients receive draw message
  - [ ] Test: Write integration test for draw sync

- [ ] Task 6: Test multiple moves sync (AC: #1, #2)
  - [ ] Create test scenario with multiple moves
  - [ ] Verify each move syncs correctly
  - [ ] Verify state remains consistent after each move
  - [ ] Test: Write integration test for multiple moves

- [ ] Task 7: Measure synchronization latency (AC: #3)
  - [ ] Add timing measurements to sync flow
  - [ ] Measure time from move to client update
  - [ ] Verify latency < 200ms
  - [ ] Test: Add performance assertions

- [ ] Task 8: Test concurrent moves handling (AC: #1, #2)
  - [ ] Test scenario with rapid moves
  - [ ] Verify no race conditions
  - [ ] Verify state consistency maintained
  - [ ] Test: Write stress test

- [ ] Task 9: Document sync flow (AC: #1)
  - [ ] Document complete sync flow
  - [ ] Document state consistency guarantees
  - [ ] Document latency requirements
  - [ ] Test: Verify documentation is accurate

## Dev Notes

### Architecture Patterns and Constraints

- **Cross-Server Sync**: Moves on one server must appear on other servers [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]
- **State Consistency**: Both servers maintain identical game state [Source: docs/epics.md#Story-4.5]
- **Real-Time Updates**: Synchronization latency < 200ms per NFR [Source: docs/epics.md#Story-4.5]
- **Event Propagation**: Move → Redis → Pub/Sub → Server B → Clients [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]

### Project Structure Notes

- Integration tests live in `packages/server/tests/integration/`
- Test setup requires two server instances and Redis
- Client mocking needed for end-to-end tests
- Performance testing included for latency verification

### Testing Standards

- **Integration Tests**: End-to-end tests with real Redis and multiple servers
- **State Verification**: Verify state consistency after each sync
- **Performance Testing**: Measure and verify latency < 200ms
- **Concurrency Testing**: Test concurrent moves and race conditions
- **Test Coverage**: Comprehensive integration test coverage

### References

- [Source: docs/epics.md#Story-4.5-Cross-Server-State-Consistency]
- [Source: docs/architecture-summary.md#Server-to-Server-Synchronization-Flow]
- [Source: docs/sprint-planning.md#Story-4.5-Cross-Server-State-Consistency]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

<!-- Will be filled during implementation -->

### Debug Log References

<!-- Will be filled during implementation -->

### Completion Notes List

<!-- Will be filled when story is complete -->

### File List

<!-- Will be filled during implementation -->

