# Client Package

CLI client for the fusion-tic-tac-toe game.

## Quick Start

### Run Client (Interactive)
```bash
npm run dev
# or
npm run run
```

### Run Client with Pre-configured Server
```bash
# Connect to Server 1 (port 3001)
npm run run:server1

# Connect to Server 2 (port 3002)
npm run run:server2

# Connect to Docker/Nginx (port 80)
npm run run:docker
```

### From Root Directory
```bash
# Interactive
npm run dev:client

# Pre-configured
npm run run:client:server1
npm run run:client:server2
npm run run:client:docker
```

## Environment Variables

- `SERVER_URL` - WebSocket server URL (default: `ws://localhost:3001`)
  - If set, skips the server URL prompt

## Usage

1. **Start the client:**
   ```bash
   npm run dev
   ```

2. **Enter server URL** (or press Enter for default):
   ```
   Enter server URL (default: ws://localhost:3001): 
   ```

3. **Enter game code:**
   - Type `NEW` to create a new game
   - Or enter an existing game code to join

4. **Play the game:**
   - When it's your turn, enter moves as `row col` (e.g., `0 0` or `1,1`)
   - Valid coordinates: 0-2 for both row and column

## Examples

### Create a New Game
```bash
$ npm run dev
Enter server URL (default: ws://localhost:3001): [Enter]
Enter game code (or "NEW" to create a game) (default: NEW): [Enter]
```

### Join Existing Game
```bash
$ npm run dev
Enter server URL (default: ws://localhost:3001): [Enter]
Enter game code (or "NEW" to create a game) (default: NEW): ABC123
```

### Connect to Different Server
```bash
$ SERVER_URL=ws://localhost:3002 npm run dev
# Skips server URL prompt, connects directly
```

## Input Format

Moves can be entered in multiple formats:
- `0 0` (space-separated)
- `0,0` (comma-separated)
- `0, 0` (comma with space)

All formats accept coordinates 0-2 for both row and column.

## Troubleshooting

**Input not working:**
- Make sure you're running in a terminal (not in a non-interactive environment)
- Check that stdin/stdout are available

**Connection failed:**
- Verify server is running
- Check server URL is correct
- Ensure firewall/network allows WebSocket connections

**Game not found:**
- Verify game code is correct (case-insensitive)
- Check that game hasn't expired (games expire after 1 hour)

