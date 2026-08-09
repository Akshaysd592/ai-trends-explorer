import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Trend } from '@ai-trend-explorer/shared-types';
import { TrendEntity } from './entities/trend.entity';
import { SourceEntity } from './entities/source.entity';
import { SourceStatus } from './aggregator/trend.aggregator';

const CACHE_TTL_MINUTES = 5;

@Injectable()
export class TrendRepository {
  private readonly logger = new Logger(TrendRepository.name);

  constructor(
    @InjectRepository(TrendEntity)
    private readonly trendRepo: Repository<TrendEntity>,
    @InjectRepository(SourceEntity)
    private readonly sourceRepo: Repository<SourceEntity>,
  ) {}

  /**
   * Save a batch of trends to the database (upsert by id).
   */
  async saveTrends(trends: Trend[]): Promise<void> {
    if (trends.length === 0) return;

    const entities: Partial<TrendEntity>[] = trends.map((trend) => ({
      id: trend.id,
      title: trend.title,
      description: trend.description ?? undefined,
      source: trend.source,
      url: trend.url,
      language: trend.language ?? undefined,
      stars: trend.stars,
      forks: trend.forks,
      score: trend.score,
      topics: trend.topics ?? [],
      createdAt: trend.createdAt ? new Date(trend.createdAt) : undefined,
      updatedAt: trend.updatedAt ? new Date(trend.updatedAt) : undefined,
    }));

    await this.trendRepo.upsert(entities, ['id']);

    this.logger.log(`Saved ${trends.length} trends to database`);
  }

  /**
   * Save or update source status.
   */
  async saveSourceStatus(
    source: string,
    status: SourceStatus,
  ): Promise<void> {
    await this.sourceRepo.upsert(
      {
        name: source,
        status: status.status,
        error: status.error ?? undefined,
      },
      ['name'],
    );
  }

  /**
   * Retrieve cached trends that are newer than the TTL.
   * Returns null if cache is stale or empty.
   */
  async getCachedTrends(): Promise<Trend[] | null> {
    const cutoff = new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000);

    const cached = await this.trendRepo.find({
      where: {
        savedAt: MoreThan(cutoff),
      },
      order: {
        score: 'DESC',
      },
    });

    if (cached.length === 0) {
      return null;
    }

    return cached.map((entity) => this.entityToTrend(entity));
  }

  /**
   * Retrieve cached source statuses.
   */
  async getCachedSourceStatuses(): Promise<Record<string, SourceStatus>> {
    const sources = await this.sourceRepo.find();
    const result: Record<string, SourceStatus> = {};
    for (const source of sources) {
      result[source.name] = {
        status: source.status as 'ok' | 'failed',
        error: source.error ?? undefined,
      };
    }
    return result;
  }

  /**
   * Fetch a single trend by ID.
   */
  async getTrendById(id: string): Promise<Trend | null> {
    const entity = await this.trendRepo.findOne({ where: { id } });
    if (!entity) return null;
    return this.entityToTrend(entity);
  }

  /**
   * Remove trends older than the TTL.
   */
  async clearStaleCache(): Promise<number> {
    const cutoff = new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000);
    const result = await this.trendRepo.delete({
      savedAt: MoreThan(cutoff),
    });
    return result.affected ?? 0;
  }

  /**
   * Convert a TrendEntity to the canonical Trend model.
   */
  private entityToTrend(entity: TrendEntity): Trend {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description ?? undefined,
      source: entity.source as 'github' | 'huggingface' | 'producthunt',
      url: entity.url,
      language: entity.language ?? null,
      stars: entity.stars ?? undefined,
      forks: entity.forks ?? undefined,
      score: entity.score,
      topics: entity.topics ?? [],
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
    };
  }
}
