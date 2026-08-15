import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { TrendAnalysis } from '@ai-trend-explorer/shared-types';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly ANALYSIS_PREFIX = 'analysis:';

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * Get cached analysis for a trend from Redis
   */
  async getCachedAnalysis(trendId: string): Promise<TrendAnalysis | null> {
    try {
      const cached = await this.redisClient.get(`${this.ANALYSIS_PREFIX}${trendId}`);
      if (!cached) {
        return null;
      }
      return JSON.parse(cached) as TrendAnalysis;
    } catch (error) {
      this.logger.error(`Failed to get cached analysis for trend "${trendId}"`, error);
      return null;
    }
  }

  /**
   * Save analysis for a trend to Redis cache
   */
  async setCachedAnalysis(analysis: TrendAnalysis, ttl: number): Promise<void> {
    try {
      await this.redisClient.setex(
        `${this.ANALYSIS_PREFIX}${analysis.trendId}`,
        ttl,
        JSON.stringify(analysis),
      );
      this.logger.log(`Cached analysis for trend "${analysis.trendId}" in Redis (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to cache analysis for trend "${analysis.trendId}"`, error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      await this.redisClient.flushdb();
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
