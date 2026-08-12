import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
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
   * Retrieve historical trends older than the cache TTL but within the historical period.
   * Returns trends from the last N days (excluding very recent ones).
   */
  async getHistoricalTrends(historicalTtlDays: number): Promise<Trend[]> {
    const recentCutoff = new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000);
    const historicalCutoff = new Date(Date.now() - historicalTtlDays * 24 * 60 * 60 * 1000);

    const historical = await this.trendRepo
      .createQueryBuilder('trend')
      .where('trend.savedAt < :recentCutoff', { recentCutoff })
      .andWhere('trend.savedAt > :historicalCutoff', { historicalCutoff })
      .orderBy('trend.score', 'DESC')
      .getMany();

    return historical.map((entity) => this.entityToTrend(entity));
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
   * Search trends by query string across title, description, and topics.
   */
  async searchTrends(query: string): Promise<Trend[]> {
    const searchTerm = `%${query}%`;
    const entities = await this.trendRepo
      .createQueryBuilder('trend')
      .where('LOWER(trend.title) LIKE LOWER(:query)', { query: searchTerm })
      .orWhere('LOWER(trend.description) LIKE LOWER(:query)', { query: searchTerm })
      .orWhere('trend.topics && ARRAY[:query]::text[]', { query: query.toLowerCase() })
      .orderBy('trend.score', 'DESC')
      .getMany();

    return entities.map((entity) => this.entityToTrend(entity));
  }

  /**
   * Get dashboard statistics aggregated from the database.
   */
  async getDashboardStats(): Promise<{
    totalTrends: number;
    sources: { github: number; huggingface: number };
    topLanguages: Array<{ language: string; count: number }>;
    topTopics: Array<{ topic: string; count: number }>;
    averageScore: number;
    totalStars: number;
  }> {
    const totalTrends = await this.trendRepo.count();

    const githubCount = await this.trendRepo.count({
      where: { source: 'github' },
    });
    const huggingfaceCount = await this.trendRepo.count({
      where: { source: 'huggingface' },
    });

    const topLanguagesRaw = await this.trendRepo
      .createQueryBuilder('trend')
      .select('trend.language', 'language')
      .addSelect('COUNT(*)', 'count')
      .where('trend.language IS NOT NULL')
      .groupBy('trend.language')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topLanguages = topLanguagesRaw.map((row) => ({
      language: row.language,
      count: parseInt(row.count, 10),
    }));

    const topTopicsRaw = await this.trendRepo
      .createQueryBuilder('trend')
      .select('unnest(trend.topics)', 'topic')
      .addSelect('COUNT(*)', 'count')
      .where('array_length(trend.topics, 1) > 0')
      .groupBy('topic')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topTopics = topTopicsRaw.map((row) => ({
      topic: row.topic,
      count: parseInt(row.count, 10),
    }));

    const scoreStats = await this.trendRepo
      .createQueryBuilder('trend')
      .select('AVG(trend.score)', 'averageScore')
      .addSelect('COALESCE(SUM(trend.stars), 0)', 'totalStars')
      .getRawOne();

    return {
      totalTrends,
      sources: {
        github: githubCount,
        huggingface: huggingfaceCount,
      },
      topLanguages,
      topTopics,
      averageScore: parseFloat(scoreStats.averageScore) || 0,
      totalStars: parseInt(scoreStats.totalStars, 10) || 0,
    };
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