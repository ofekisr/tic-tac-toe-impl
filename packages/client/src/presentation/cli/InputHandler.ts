import * as readline from 'readline';

/**
 * InputHandler handles user input with validation and retry logic.
 */
export class InputHandler {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Parse user input into row and column coordinates.
   * 
   * Supports formats: "1 1", "1,1", "1, 1"
   * 
   * @param input - User input string
   * @returns Parsed coordinates or null if invalid
   */
  parseInput(input: string): { row: number; col: number } | null {
    // Remove whitespace and normalize separators
    const normalized = input.trim().replace(/\s*,\s*/, ' ').replace(/\s+/, ' ');
    const parts = normalized.split(' ');

    if (parts.length !== 2) {
      return null;
    }

    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);

    if (isNaN(row) || isNaN(col)) {
      return null;
    }

    return { row, col };
  }

  /**
   * Validate that row and column are within bounds (0-2).
   * 
   * @param row - Row coordinate
   * @param col - Column coordinate
   * @returns true if valid, false otherwise
   */
  validateInput(row: number, col: number): boolean {
    return row >= 0 && row < 3 && col >= 0 && col < 3;
  }

  /**
   * Prompt user for move input with validation and retry.
   * 
   * @param playerSymbol - Current player symbol (X or O)
   * @returns Promise resolving to valid coordinates
   */
  promptForMove(playerSymbol: string): Promise<{ row: number; col: number }> {
    return new Promise((resolve) => {
      const askForInput = () => {
        this.rl.question(
          `Your turn (${playerSymbol}): Enter move (row col): `,
          (input: string) => {
            const parsed = this.parseInput(input);

            if (!parsed) {
              console.log(
                "Invalid input. Please enter row and column (0-2), e.g., '1 1'",
              );
              askForInput();
              return;
            }

            if (!this.validateInput(parsed.row, parsed.col)) {
              console.log(
                'Invalid position. Row and column must be between 0 and 2.',
              );
              askForInput();
              return;
            }

            resolve(parsed);
          },
        );
      };

      askForInput();
    });
  }

  /**
   * Close the readline interface.
   */
  close(): void {
    this.rl.close();
  }
}

