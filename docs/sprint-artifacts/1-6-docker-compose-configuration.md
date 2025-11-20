# Story 1.6: Docker Compose Configuration

Status: drafted

## Story

As a developer,
I want Docker Compose configuration for Redis and server instances,
So that I can run the complete system locally with proper orchestration.

## Acceptance Criteria

1. **Given** Docker and Docker Compose are installed
   **When** I create `docker-compose.yml`
   **Then** the file defines services:
   - `redis`: Redis server on port 6379
   - `app1`: Server instance on port 3001 (Server A)
   - `app2`: Server instance on port 3002 (Server B)
   - `nginx`: Load balancer on port 80 (optional for MVP)

2. **And** each server service:
   - Builds from `packages/server/` directory
   - Sets environment variables: `REDIS_HOST=redis`, `REDIS_PORT=6379`, `SERVER_PORT` (3001 or 3002), `SERVER_ID` (server-a or server-b)
   - Depends on `redis` service
   - Exposes appropriate ports

3. **And** running `docker-compose up` starts all services successfully

## Tasks / Subtasks

- [ ] Task 1: Create docker-compose.yml file (AC: #1)
  - [ ] Create `docker-compose.yml` at project root
  - [ ] Define `redis` service:
    - Image: `redis:latest`
    - Port: `6379:6379`
    - Health check configuration
  - [ ] Define `app1` service (Server A):
    - Build context: `packages/server/`
    - Port: `3001:3001`
    - Environment variables: `REDIS_HOST=redis`, `REDIS_PORT=6379`, `SERVER_PORT=3001`, `SERVER_ID=server-a`
    - Depends on: `redis`
  - [ ] Define `app2` service (Server B):
    - Build context: `packages/server/`
    - Port: `3002:3002`
    - Environment variables: `REDIS_HOST=redis`, `REDIS_PORT=6379`, `SERVER_PORT=3002`, `SERVER_ID=server-b`
    - Depends on: `redis`
  - [ ] Define `nginx` service (optional):
    - Image: `nginx:latest`
    - Port: `80:80`
    - Volumes: `./docker/nginx.conf:/etc/nginx/nginx.conf`
    - Depends on: `app1`, `app2`
  - [ ] Test: Verify docker-compose.yml syntax is valid

- [ ] Task 2: Create Dockerfile for server (AC: #2)
  - [ ] Create `packages/server/Dockerfile`
  - [ ] Use Node.js base image
  - [ ] Set working directory
  - [ ] Copy package.json and install dependencies
  - [ ] Copy source files
  - [ ] Build TypeScript
  - [ ] Expose port 3001 (or from env)
  - [ ] Set CMD to start server
  - [ ] Test: Build Docker image and verify it builds successfully

- [ ] Task 3: Create nginx configuration (AC: #1)
  - [ ] Create `docker/nginx.conf` file
  - [ ] Configure upstream servers (app1, app2)
  - [ ] Configure WebSocket proxy settings
  - [ ] Configure load balancing (round-robin)
  - [ ] Test: Verify nginx config syntax is valid

- [ ] Task 4: Verify Docker Compose startup (AC: #3)
  - [ ] Run `docker-compose up --build` command
  - [ ] Verify redis service starts successfully
  - [ ] Verify app1 service starts successfully
  - [ ] Verify app2 service starts successfully
  - [ ] Verify nginx service starts successfully (if included)
  - [ ] Test: Check logs for each service to confirm no errors
  - [ ] Test: Verify services are accessible on configured ports

## Dev Notes

### Architecture Patterns and Constraints

- **Docker Compose**: Architecture specifies Docker Compose for deployment orchestration [Source: docs/architecture.md#Decision-Summary]
- **Multi-Server Setup**: Two server instances demonstrate multi-server synchronization [Source: docs/architecture.md#Deployment-Architecture]
- **Redis Service**: Redis provides shared state storage for stateless servers [Source: docs/architecture.md#Deployment-Architecture]
- **Load Balancer**: Nginx load balancer distributes connections across servers [Source: docs/architecture.md#Deployment-Architecture]

### Project Structure Notes

- `docker-compose.yml` at project root
- `packages/server/Dockerfile` for server containerization
- `docker/nginx.conf` for load balancer configuration
- Environment variables configure server behavior per instance

### Testing Standards

- Verify Docker Compose services start without errors
- Test service health checks
- Verify port mappings work correctly
- Test service dependencies (app1/app2 depend on redis)

### References

- [Source: docs/epics.md#Story-1.6-Docker-Compose-Configuration]
- [Source: docs/architecture.md#Deployment-Architecture]
- [Source: docs/architecture.md#Decision-Summary]
- [Source: docs/sprint-planning.md#Development-Principles]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

