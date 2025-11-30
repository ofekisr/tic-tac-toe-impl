#!/usr/bin/env node

import * as readline from 'readline';
import { GameClient } from './presentation/cli/GameClient';

/**
 * Helper to prompt for input using a shared readline interface.
 */
function promptInput(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const fullQuestion = defaultValue 
      ? `${question} (default: ${defaultValue}): `
      : `${question}: `;
    
    rl.question(fullQuestion, (answer: string) => {
      const trimmed = answer.trim();
      resolve(trimmed || defaultValue || '');
    });
  });
}

/**
 * Main entry point for the CLI client.
 */
async function main(): Promise<void> {
  // Create a single readline interface for all input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Get server URL from environment variable or prompt
    const defaultServerUrl = process.env.SERVER_URL || 'ws://localhost:3001';
    const serverUrl = process.env.SERVER_URL 
      ? defaultServerUrl
      : await promptInput(
          rl,
          'Enter server URL',
          defaultServerUrl
        );

    console.log(`Connecting to ${serverUrl}...`);

    // Create and start game client
    const gameClient = new GameClient();

    try {
      await gameClient.connect(serverUrl);
      console.log('Connected!');

      // Prompt for game code
      const gameCode = await promptInput(
        rl,
        'Enter game code (or "NEW" to create a game)',
        'NEW'
      );

      // Close the readline interface before starting the game
      // (InputHandler will create its own for move input)
      rl.close();

      // Join game
      gameClient.joinGame(gameCode.toUpperCase());

      // Keep process alive
      process.on('SIGINT', async () => {
        await gameClient.disconnect();
        process.exit(0);
      });
    } catch (error) {
      rl.close();
      console.error('Failed to connect:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  } catch (error) {
    rl.close();
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
