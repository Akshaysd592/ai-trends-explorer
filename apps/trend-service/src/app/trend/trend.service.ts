import { TrendQuery, Trend } from '@ai-trend-explorer/shared-types';
import { Injectable, Logger } from '@nestjs/common';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { AggregatedTrendResult } from './aggregator/trend.aggregator';
import { TrendRepository } from './trend.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';
import { KafkaProducerService } from '../kafka/kafka.producer.service';

@Injectable()
export class TrendService {
  private readonly logger = new Logger(TrendService.name);

  constructor(
    private readonly aggregator: TrendAggregator,
    private readonly repository: TrendRepository,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async getTrending(query: TrendQuery): Promise<AggregatedTrendResult> {
    const redisTtl = this.configService.getConfig().redis.cacheTtl;
    const historicalTtlDays = this.configService.getConfig().trends.historicalTtlDays;

    // Check Redis cache first
    const redisCachedTrends = await this.redisCacheService.getCachedTrends();
    if (redisCachedTrends && redisCachedTrends.length > 0) {
      this.logger.log('Returning cached trends from Redis');
      const redisCachedSources = await this.redisCacheService.getCachedSourceStatuses();

      // Also fetch historical trends to show older data
      const historicalTrends = await this.repository.getHistoricalTrends(historicalTtlDays);

      // Merge recent and historical trends
      const mergedTrends = this.mergeAndDeduplicate(redisCachedTrends, historicalTrends);

      return {
        trends: mergedTrends,
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

      // Also fetch historical trends to show older data
      const historicalTrends = await this.repository.getHistoricalTrends(historicalTtlDays);

      // Merge recent and historical trends
      const mergedTrends = this.mergeAndDeduplicate(cachedTrends, historicalTrends);

      return {
        trends: mergedTrends,
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

    // Publish freshly discovered trends to Kafka so the analysis service
    // can auto-generate AI analysis asynchronously.
    await this.kafkaProducer.publishDiscoveredTrends(result.trends);

    // Update Redis cache
    await this.redisCacheService.setCachedTrends(result.trends, redisTtl);
    await this.redisCacheService.setCachedSourceStatuses(result.sources, redisTtl);

    // Also fetch historical trends to show older data
    const historicalTrends = await this.repository.getHistoricalTrends(historicalTtlDays);

    // Merge recent and historical trends
    const mergedTrends = this.mergeAndDeduplicate(result.trends, historicalTrends);

    return {
      trends: mergedTrends,
      sources: result.sources,
    };
  }

  /**
   * Merge two trend arrays, deduplicate by ID, and sort by score.
   * Recent trends take precedence over historical ones with the same ID.
   */
  private mergeAndDeduplicate(recent: Trend[], historical: Trend[]): Trend[] {
    const seen = new Set<string>();
    const merged: Trend[] = [];

    // Add recent trends first (they take precedence)
    for (const trend of recent) {
      if (!seen.has(trend.id)) {
        seen.add(trend.id);
        merged.push(trend);
      }
    }

    // Add historical trends that don't exist in recent
    for (const trend of historical) {
      if (!seen.has(trend.id)) {
        seen.add(trend.id);
        merged.push(trend);
      }
    }

    // Sort by score descending
    return merged.sort((a, b) => b.score - a.score);
  }

  async getTrendById(id: string): Promise<Trend | null> {
    return this.repository.getTrendById(id);
  }

  async searchTrends(query: string): Promise<Trend[]> {
    return this.repository.searchTrends(query);
  }

  async getDashboardStats(): Promise<{
    totalTrends: number;
    sources: { github: number; huggingface: number };
    topLanguages: Array<{ language: string; count: number }>;
    topTopics: Array<{ topic: string; count: number }>;
    averageScore: number;
    totalStars: number;
  }> {
    return this.repository.getDashboardStats();
  }
}
