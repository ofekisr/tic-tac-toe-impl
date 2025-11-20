# Fusion Tic-Tac-Toe

A real-time multiplayer Tic-Tac-Toe game system built with TypeScript, NestJS, WebSocket, and Redis. This project demonstrates distributed architecture principles with stateless server instances and real-time state synchronization.

## Project Structure

This is a monorepo managed with npm workspaces, enabling parallel development of server and client packages.

```
fusion-tic-tac-toe/
├── packages/
│   ├── shared/          # Shared TypeScript types and contracts
│   ├── server/          # NestJS WebSocket server
│   ├── client/          # CLI client application
│   └── mock-server/     # Standalone mock server for testing
├── package.json         # Root workspace configuration
└── tsconfig.json        # Root TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js LTS (20.x or later)
- npm (comes with Node.js)
- Docker and Docker Compose (for local development)

### Installation

```bash
# Install dependencies for all packages
npm install
```

### Development

```bash
# Build all packages
npm run build

# Run tests for all packages
npm run test

# Start server in development mode
npm run dev:server

# Start client in development mode
npm run dev:client

# Start mock server in development mode
npm run dev:mock-server
```

## Architecture

This project follows a layered architecture pattern:

- **Domain Layer**: Pure business logic with no dependencies
- **Application Layer**: Use cases and business services
- **Infrastructure Layer**: Redis integration, external services
- **Presentation Layer**: WebSocket gateways, HTTP controllers

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Technology Stack

- **Language**: TypeScript
- **Server Framework**: NestJS
- **WebSocket**: @nestjs/websockets
- **State Management**: Redis
- **Testing**: Jest
- **Deployment**: Docker Compose

## License

ISC

