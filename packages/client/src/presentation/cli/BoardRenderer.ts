import { BoardDTO } from '@fusion-tic-tac-toe/shared';

/**
 * BoardRenderer renders the game board in ASCII format for CLI display.
 */
export class BoardRenderer {
  /**
   * Render the board as an ASCII string.
   * 
   * @param board - Board DTO (BoardCell[][])
   * @returns ASCII representation of the board
   */
  renderBoard(board: BoardDTO): string {
    let output = '    0   1   2\n';
    
    for (let row = 0; row < 3; row++) {
      output += `${row}  `;
      for (let col = 0; col < 3; col++) {
        const cell = board[row][col];
        const display = cell === '' ? ' ' : cell;
        output += `[${display}]`;
        if (col < 2) {
          output += ' ';
        }
      }
      output += '\n';
    }
    
    return output;
  }

  /**
   * Display the board to the console.
   * 
   * @param board - Board DTO (BoardCell[][])
   */
  displayBoard(board: BoardDTO): void {
    console.log(this.renderBoard(board));
  }
}

