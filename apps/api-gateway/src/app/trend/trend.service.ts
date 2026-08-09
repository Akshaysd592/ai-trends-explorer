import { TrendQuery, Trend } from '@ai-trend-explorer/shared-types';
import { Injectable, Logger } from '@nestjs/common';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { AggregatedTrendResult } from './aggregator/trend.aggregator';
import { TrendRepository } from './trend.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';

@Injectable()
export class TrendService {
  private readonly logger = new Logger(TrendService.name);

  constructor(
    private readonly aggregator: TrendAggregator,
    private readonly repository: TrendRepository,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  async getTrending(query: TrendQuery): Promise<AggregatedTrendResult> {
    const redisTtl = this.configService.getConfig().redis.cacheTtl;

    // Check Redis cache first
    const redisCachedTrends = await this.redisCacheService.getCachedTrends();
    if (redisCachedTrends && redisCachedTrends.length > 0) {
      this.logger.log('Returning cached trends from Redis');
      const redisCachedSources = await this.redisCacheService.getCachedSourceStatuses();
      return {
        trends: redisCachedTrends,
        sources: redisCachedSources,
      };
    }

    // Check PostgreSQL cache
    const cachedTrends = await this.repository.getCachedTrends();
    if (cachedTrends) {
      this.logger.log('Returning cached trends from PostgreSQL');
      const cachedSources = await this.repository.getCachedSourceStatuses();
      
      // Update Redis cache with PostgreSQL data
      await this.redisCacheService.setCachedTrends(cachedTrends, redisTtl);
      await this.redisCacheService.setCachedSourceStatuses(cachedSources, redisTtl);
      
      return {
        trends: cachedTrends,
        sources: cachedSources,
      };
    }

    // Cache miss — fetch from providers
    this.logger.log('Cache miss, fetching from providers');
    const result = await this.aggregator.getTrending(query);

    // Persist results for future cache hits
    await this.repository.saveTrends(result.trends);
    for (const [source, status] of Object.entries(result.sources)) {
      await this.repository.saveSourceStatus(source, status);
    }

    // Update Redis cache
    await this.redisCacheService.setCachedTrends(result.trends, redisTtl);
    await this.redisCacheService.setCachedSourceStatuses(result.sources, redisTtl);

    return result;
  }

  async getTrendById(id: string): Promise<Trend | null> {
    return this.repository.getTrendById(id);
  }
}
