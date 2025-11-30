import { Injectable, Inject } from '@nestjs/common';
import { GameCode } from '../../domain/value-objects/GameCode';
import { IGameRepository } from '../../domain/interfaces/IGameRepository';

/**
 * GameService handles game-related business logic.
 * 
 * This service is responsible for generating unique game codes
 * and coordinating game creation operations.
 */
@Injectable()
export class GameService {
  private static readonly MAX_RETRIES = 10;

  constructor(
    @Inject('IGameRepository')
    private readonly gameRepository: IGameRepository,
  ) {}

  /**
   * Generates a unique game code by checking against the repository.
   * Retries up to MAX_RETRIES times if generated code already exists.
   * 
   * @returns Promise that resolves to a unique game code
   * @throws Error if unable to generate unique code after MAX_RETRIES attempts
   */
  async generateUniqueGameCode(): Promise<string> {
    for (let attempt = 0; attempt < GameService.MAX_RETRIES; attempt++) {
      const code = GameCode.generate();

      const exists = await this.gameRepository.exists(code);
      if (!exists) {
        return code;
      }
    }

    throw new Error(
      `Failed to generate unique game code after ${GameService.MAX_RETRIES} attempts`,
    );
  }
}

