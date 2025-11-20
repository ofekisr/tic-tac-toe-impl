#!/usr/bin/env node

import * as readline from 'readline';
import { GameClient } from './presentation/cli/GameClient';

/**
 * Main entry point for the CLI client.
 */
async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt for server URL
  const serverUrl = await new Promise<string>((resolve) => {
    rl.question(
      'Enter server URL (default: ws://localhost:3001): ',
      (answer: string) => {
        resolve(answer.trim() || 'ws://localhost:3001');
      },
    );
  });

  rl.close();

  // Create and start game client
  const gameClient = new GameClient();

  try {
    await gameClient.connect(serverUrl);

    // Prompt for game code
    const gameCodeRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const gameCode = await new Promise<string>((resolve) => {
      gameCodeRl.question(
        'Enter game code (or "NEW" to create a game): ',
        (answer: string) => {
          resolve(answer.trim().toUpperCase());
        },
      );
    });

    gameCodeRl.close();

    // Join game
    gameClient.joinGame(gameCode);

    // Keep process alive
    process.on('SIGINT', async () => {
      await gameClient.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to connect:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
