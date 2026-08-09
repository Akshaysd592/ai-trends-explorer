import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Trend } from '@ai-trend-explorer/shared-types';
import { SourceStatus } from '../trend/aggregator/trend.aggregator';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly CACHE_KEY = 'trends:cache';
  private readonly SOURCES_KEY = 'trends:sources';

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * Get cached trends from Redis
   */
  async getCachedTrends(): Promise<Trend[] | null> {
    try {
      const cached = await this.redisClient.get(this.CACHE_KEY);
      if (!cached) {
        return null;
      }
      this.logger.log('Cache hit from Redis');
      return JSON.parse(cached) as Trend[];
    } catch (error) {
      this.logger.error('Failed to get cached trends from Redis', error);
      return null;
    }
  }

  /**
   * Get cached source statuses from Redis
   */
  async getCachedSourceStatuses(): Promise<Record<string, SourceStatus>> {
    try {
      const cached = await this.redisClient.get(this.SOURCES_KEY);
      if (!cached) {
        return {};
      }
      return JSON.parse(cached) as Record<string, SourceStatus>;
    } catch (error) {
      this.logger.error('Failed to get cached source statuses from Redis', error);
      return {};
    }
  }

  /**
   * Save trends to Redis cache
   */
  async setCachedTrends(trends: Trend[], ttl: number): Promise<void> {
    try {
      await this.redisClient.setex(
        this.CACHE_KEY,
        ttl,
        JSON.stringify(trends),
      );
      this.logger.log(`Cached ${trends.length} trends in Redis (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error('Failed to cache trends in Redis', error);
    }
  }

  /**
   * Save source statuses to Redis cache
   */
  async setCachedSourceStatuses(
    sources: Record<string, SourceStatus>,
    ttl: number,
  ): Promise<void> {
    try {
      await this.redisClient.setex(
        this.SOURCES_KEY,
        ttl,
        JSON.stringify(sources),
      );
      this.logger.log('Cached source statuses in Redis');
    } catch (error) {
      this.logger.error('Failed to cache source statuses in Redis', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      await this.redisClient.del(this.CACHE_KEY, this.SOURCES_KEY);
      this.logger.log('Cleared Redis cache');
    } catch (error) {
      this.logger.error('Failed to clear Redis cache', error);
    }
  }

  /**
   * Check Redis connection health
   */
  async isConnected(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection', error);
    }
  }
}