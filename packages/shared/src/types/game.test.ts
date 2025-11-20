import {
  Board,
  BoardMapper,
  Move,
  BoardCell,
  PlayerSymbol,
  BOARD_SIZE,
  EMPTY_CELL,
} from './game';

describe('Board', () => {
  describe('constructor', () => {
    it('should create empty 3x3 board when no cells provided', () => {
      // Arrange & Act
      const board = new Board();

      // Assert
      expect(board.toArray()).toEqual([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ]);
    });

    it('should create board from provided cells', () => {
      // Arrange
      const cells: BoardCell[][] = [
        ['X', 'O', ''],
        ['', 'X', 'O'],
        ['O', '', 'X'],
      ];

      // Act
      const board = new Board(cells);

      // Assert
      expect(board.toArray()).toEqual(cells);
    });

    it('should throw error for invalid board size (wrong rows)', () => {
      // Arrange
      const cells: BoardCell[][] = [
        ['', '', ''],
        ['', '', ''],
      ];

      // Act & Assert
      expect(() => new Board(cells)).toThrow('Board must be 3x3');
    });

    it('should throw error for invalid board size (wrong columns)', () => {
      // Arrange
      const cells: BoardCell[][] = [
        ['', '', ''],
        ['', '', ''],
        ['', ''],
      ];

      // Act & Assert
      expect(() => new Board(cells)).toThrow('Board must be 3x3');
    });
  });

  describe('getCell', () => {
    it('should get cell value at position', () => {
      // Arrange
      const board = new Board();
      board.setCell(1, 1, 'X');

      // Act
      const cell = board.getCell(1, 1);

      // Assert
      expect(cell).toBe('X');
    });

    it('should throw error for invalid row', () => {
      // Arrange
      const board = new Board();

      // Act & Assert
      expect(() => board.getCell(-1, 1)).toThrow('Position must be between 0 and 2');
      expect(() => board.getCell(3, 1)).toThrow('Position must be between 0 and 2');
    });

    it('should throw error for invalid col', () => {
      // Arrange
      const board = new Board();

      // Act & Assert
      expect(() => board.getCell(1, -1)).toThrow('Position must be between 0 and 2');
      expect(() => board.getCell(1, 3)).toThrow('Position must be between 0 and 2');
    });
  });

  describe('setCell', () => {
    it('should set cell value at position', () => {
      // Arrange
      const board = new Board();

      // Act
      board.setCell(0, 0, 'X');

      // Assert
      expect(board.getCell(0, 0)).toBe('X');
    });

    it('should throw error for invalid position', () => {
      // Arrange
      const board = new Board();

      // Act & Assert
      expect(() => board.setCell(-1, 1, 'X')).toThrow('Position must be between 0 and 2');
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty cell', () => {
      // Arrange
      const board = new Board();

      // Act
      const result = board.isEmpty(1, 1);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for occupied cell', () => {
      // Arrange
      const board = new Board();
      board.setCell(1, 1, 'X');

      // Act
      const result = board.isEmpty(1, 1);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false for empty board', () => {
      // Arrange
      const board = new Board();

      // Act
      const result = board.isFull();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for partially filled board', () => {
      // Arrange
      const board = new Board();
      board.setCell(0, 0, 'X');
      board.setCell(0, 1, 'O');

      // Act
      const result = board.isFull();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for full board', () => {
      // Arrange
      const cells: BoardCell[][] = [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', 'X', 'O'],
      ];
      const board = new Board(cells);

      // Act
      const result = board.isFull();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('toArray', () => {
    it('should return deep copy of cells', () => {
      // Arrange
      const board = new Board();
      board.setCell(1, 1, 'X');

      // Act
      const array1 = board.toArray();
      const array2 = board.toArray();

      // Assert
      expect(array1).toEqual(array2);
      expect(array1).not.toBe(array2); // Different references
      expect(array1[1]).not.toBe(array2[1]); // Different row references
    });

    it('should prevent external mutation', () => {
      // Arrange
      const board = new Board();
      const array = board.toArray();

      // Act
      array[1][1] = 'X';

      // Assert
      expect(board.getCell(1, 1)).toBe(''); // Original board unchanged
    });
  });

  describe('fromArray', () => {
    it('should create board from array', () => {
      // Arrange
      const cells: BoardCell[][] = [
        ['X', 'O', ''],
        ['', 'X', 'O'],
        ['O', '', 'X'],
      ];

      // Act
      const board = Board.fromArray(cells);

      // Assert
      expect(board.toArray()).toEqual(cells);
    });
  });
});

describe('BoardMapper', () => {
  describe('toDTO', () => {
    it('should convert Board to BoardDTO', () => {
      // Arrange
      const board = new Board();
      board.setCell(1, 1, 'X');

      // Act
      const dto = BoardMapper.toDTO(board);

      // Assert
      expect(dto).toEqual([
        ['', '', ''],
        ['', 'X', ''],
        ['', '', ''],
      ]);
    });
  });

  describe('fromDTO', () => {
    it('should convert BoardDTO to Board', () => {
      // Arrange
      const dto: BoardCell[][] = [
        ['X', 'O', ''],
        ['', 'X', 'O'],
        ['O', '', 'X'],
      ];

      // Act
      const board = BoardMapper.fromDTO(dto);

      // Assert
      expect(board.toArray()).toEqual(dto);
    });
  });
});

describe('Move', () => {
  describe('constructor', () => {
    it('should create move with valid data', () => {
      // Arrange & Act
      const move = new Move(1, 1, 'X');

      // Assert
      expect(move.row).toBe(1);
      expect(move.col).toBe(1);
      expect(move.player).toBe('X');
      expect(move.timestamp).toBeInstanceOf(Date);
    });

    it('should use provided timestamp', () => {
      // Arrange
      const timestamp = new Date('2024-01-01');

      // Act
      const move = new Move(1, 1, 'X', timestamp);

      // Assert
      expect(move.timestamp).toBe(timestamp);
    });

    it('should throw error for invalid row', () => {
      // Act & Assert
      expect(() => new Move(-1, 1, 'X')).toThrow('Position must be between 0 and 2');
      expect(() => new Move(3, 1, 'X')).toThrow('Position must be between 0 and 2');
    });

    it('should throw error for invalid col', () => {
      // Act & Assert
      expect(() => new Move(1, -1, 'X')).toThrow('Position must be between 0 and 2');
      expect(() => new Move(1, 3, 'X')).toThrow('Position must be between 0 and 2');
    });

    it('should throw error for invalid player', () => {
      // Act & Assert
      expect(() => new Move(1, 1, 'Z' as PlayerSymbol)).toThrow("Player must be 'X' or 'O'");
    });
  });

  describe('toPosition', () => {
    it('should return position object', () => {
      // Arrange
      const move = new Move(1, 2, 'X');

      // Act
      const position = move.toPosition();

      // Assert
      expect(position).toEqual({ row: 1, col: 2 });
    });
  });

  describe('equals', () => {
    it('should return true for equal moves', () => {
      // Arrange
      const move1 = new Move(1, 1, 'X');
      const move2 = new Move(1, 1, 'X');

      // Act
      const result = move1.equals(move2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different row', () => {
      // Arrange
      const move1 = new Move(1, 1, 'X');
      const move2 = new Move(2, 1, 'X');

      // Act
      const result = move1.equals(move2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for different col', () => {
      // Arrange
      const move1 = new Move(1, 1, 'X');
      const move2 = new Move(1, 2, 'X');

      // Act
      const result = move1.equals(move2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for different player', () => {
      // Arrange
      const move1 = new Move(1, 1, 'X');
      const move2 = new Move(1, 1, 'O');

      // Act
      const result = move1.equals(move2);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe('Constants', () => {
  it('should export BOARD_SIZE as 3', () => {
    expect(BOARD_SIZE).toBe(3);
  });

  it('should export EMPTY_CELL as empty string', () => {
    expect(EMPTY_CELL).toBe('');
  });
});

