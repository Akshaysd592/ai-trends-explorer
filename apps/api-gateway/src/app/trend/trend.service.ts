import { TrendQuery, Trend } from '@ai-trend-explorer/shared-types';
import { Injectable, Logger } from '@nestjs/common';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { AggregatedTrendResult } from './aggregator/trend.aggregator';
import { TrendRepository } from './trend.repository';

@Injectable()
export class TrendService {
  private readonly logger = new Logger(TrendService.name);

  constructor(
    private readonly aggregator: TrendAggregator,
    private readonly repository: TrendRepository,
  ) {}

  async getTrending(query: TrendQuery): Promise<AggregatedTrendResult> {
    // Check cache first
    const cachedTrends = await this.repository.getCachedTrends();
    if (cachedTrends) {
      this.logger.log('Returning cached trends from database');
      const cachedSources = await this.repository.getCachedSourceStatuses();
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

    return result;
  }

  async getTrendById(id: string): Promise<Trend | null> {
    return this.repository.getTrendById(id);
  }
}
