import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * RedisService provides low-level Redis operations including pub/sub.
 * 
 * This service wraps ioredis client and provides:
 * - Basic operations (get, set, hget, hset, hgetall)
 * - Pub/sub operations (publish, subscribe)
 * - Connection management
 * - Error handling
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private subscriber: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    const redisOptions = {
      host,
      port,
      password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(
          `Redis connection retry attempt ${times}, delay ${delay}ms`,
        );
        return delay;
      },
    };

    // Main Redis client for regular operations
    this.redis = new Redis(redisOptions);

    // Separate subscriber client for pub/sub (required by Redis)
    this.subscriber = new Redis(redisOptions);

    this.redis.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`, error.stack);
    });

    this.subscriber.on('connect', () => {
      this.logger.log(`Redis subscriber connected at ${host}:${port}`);
    });

    this.subscriber.on('error', (error) => {
      this.logger.error(`Redis subscriber error: ${error.message}`, error.stack);
    });
  }

  onModuleInit() {
    // Connections are established in constructor
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.subscriber.disconnect();
  }

  /**
   * Get a value by key.
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Set a key-value pair.
   */
  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  /**
   * Get a field from a hash.
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  /**
   * Set a field in a hash.
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  /**
   * Get all fields and values from a hash.
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  /**
   * Publish a message to a Redis channel.
   * 
   * @param channel - Channel name
   * @param message - Message to publish (will be JSON stringified if object)
   */
  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.redis.publish(channel, message);
      this.logger.debug(`Published message to channel: ${channel}`);
    } catch (error) {
      this.logger.error(
        `Error publishing to channel ${channel}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private messageCallbacks: Map<string, (channel: string, message: string) => void> = new Map();

  /**
   * Subscribe to a Redis channel pattern.
   * 
   * @param pattern - Channel pattern (e.g., 'game:sync:*')
   * @param callback - Callback function to handle messages
   */
  async subscribe(
    pattern: string,
    callback: (channel: string, message: string) => void,
  ): Promise<void> {
    try {
      // Store callback for this pattern
      this.messageCallbacks.set(pattern, callback);

      // Set up pmessage handler only once
      if (this.messageCallbacks.size === 1) {
        this.subscriber.on('pmessage', (pattern, channel, message) => {
          this.logger.debug(
            `Received message on channel ${channel} (pattern: ${pattern})`,
          );
          const callback = this.messageCallbacks.get(pattern);
          if (callback) {
            callback(channel, message);
          }
        });
      }

      await this.subscriber.psubscribe(pattern);
      this.logger.log(`Subscribed to pattern: ${pattern}`);
    } catch (error) {
      this.messageCallbacks.delete(pattern);
      this.logger.error(
        `Error subscribing to pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe from a Redis channel pattern.
   * 
   * @param pattern - Channel pattern to unsubscribe from
   */
  async unsubscribe(pattern: string): Promise<void> {
    try {
      await this.subscriber.punsubscribe(pattern);
      this.messageCallbacks.delete(pattern);
      this.logger.log(`Unsubscribed from pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get the underlying Redis client (for advanced operations).
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Get the subscriber client (for advanced pub/sub operations).
   */
  getSubscriber(): Redis {
    return this.subscriber;
  }
}

