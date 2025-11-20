import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * RedisModule provides RedisService for use across the application.
 * 
 * Configures Redis connection from environment variables:
 * - REDIS_HOST (default: localhost)
 * - REDIS_PORT (default: 6379)
 * - REDIS_PASSWORD (optional)
 */
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}

