import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TrendAnalysis } from '@ai-trend-explorer/shared-types';
import { AnalysisRepository } from './ai-analysis.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { KafkaProducerService, TrendAnalysisRequest } from '../kafka/kafka.producer.service';
import { GeminiInferenceClient } from './ai-analysis.client';
import { ConfigService } from '@ai-trend-explorer/config';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly redisCacheService: RedisCacheService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly geminiClient: GeminiInferenceClient,
    private readonly configService: ConfigService,
  ) {}

  async getAnalysis(trendId: string): Promise<TrendAnalysis> {
    const redisTtl = this.configService.getConfig().redis.cacheTtl;

    // Check Redis cache first
    const cached = await this.redisCacheService.getCachedAnalysis(trendId);
    if (cached) {
      this.logger.log(`Cache hit from Redis for trend "${trendId}"`);
      return cached;
    }

    // Check PostgreSQL
    const existing = await this.analysisRepository.getAnalysisByTrendId(trendId);
    if (existing) {
      this.logger.log(`Cache hit from PostgreSQL for trend "${trendId}"`);
      // Update Redis cache
      await this.redisCacheService.setCachedAnalysis(existing, redisTtl);
      return existing;
    }

    // No analysis found — return pending status
    return {
      trendId,
      summary: '',
      keyPoints: [],
      category: '',
      sentiment: 'neutral',
      tags: [],
      status: 'pending',
    };
  }

  async requestAnalysis(trend: TrendAnalysisRequest): Promise<TrendAnalysis> {
    const redisTtl = this.configService.getConfig().redis.cacheTtl;

    // Save pending record
    await this.analysisRepository.savePendingAnalysis(trend.trendId);

    // Publish to Kafka for async processing
    await this.kafkaProducer.publishAnalysisRequest(trend);

    const pending: TrendAnalysis = {
      trendId: trend.trendId,
      summary: '',
      keyPoints: [],
      category: '',
      sentiment: 'neutral',
      tags: [],
      status: 'pending',
    };

    // Cache the pending result
    await this.redisCacheService.setCachedAnalysis(pending, redisTtl);

    return pending;
  }

  async processAnalysis(trend: TrendAnalysisRequest): Promise<TrendAnalysis> {
    this.logger.log(`Processing analysis for trend "${trend.trendId}"`);

    try {
      const analysis = await this.geminiClient.generateAnalysis(
        trend.trendId,
        trend.title,
        trend.description,
        trend.topics,
      );

      // Save to database
      await this.analysisRepository.saveAnalysis(analysis);

      // Update Redis cache
      const redisTtl = this.configService.getConfig().redis.cacheTtl;
      await this.redisCacheService.setCachedAnalysis(analysis, redisTtl);

      this.logger.log(`Analysis completed for trend "${trend.trendId}"`);
      return analysis;
    } catch (error) {
      this.logger.error(
        `Failed to process analysis for trend "${trend.trendId}"`,
        error instanceof Error ? error.stack : undefined,
      );

      // Save failed status
      await this.analysisRepository.saveAnalysis({
        trendId: trend.trendId,
        summary: '',
        keyPoints: [],
        category: '',
        sentiment: 'neutral',
        tags: [],
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
