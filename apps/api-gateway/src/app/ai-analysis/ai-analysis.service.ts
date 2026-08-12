import { Injectable, Logger } from '@nestjs/common';
import { TrendAnalysis } from '@ai-trend-explorer/shared-types';
import { KafkaProducerService, TrendAnalysisRequest } from '../kafka/kafka.producer.service';
import { GeminiInferenceClient } from './ai-analysis.client';
import { AnalysisRepository } from './ai-analysis.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly inferenceClient: GeminiInferenceClient,
    private readonly analysisRepository: AnalysisRepository,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Request AI analysis for a trend — publishes to Kafka and saves a pending record.
   */
  async requestAnalysis(trend: TrendAnalysisRequest): Promise<TrendAnalysis> {
    const pendingAnalysis: TrendAnalysis = {
      trendId: trend.trendId,
      summary: '',
      keyPoints: [],
      category: '',
      sentiment: 'neutral',
      tags: [],
      status: 'pending',
    };

    // Save pending status to DB
    await this.analysisRepository.saveAnalysis(pendingAnalysis);

    // Publish to Kafka for async processing
    await this.kafkaProducer.publishAnalysisRequest(trend);

    this.logger.log(`Analysis requested for trend "${trend.trendId}"`);
    return pendingAnalysis;
  }

  /**
   * Process a Kafka message — calls the LLM and persists the result.
   */
  async processMessage(payload: TrendAnalysisRequest): Promise<void> {
    try {
      const generatedText = await this.inferenceClient.analyzeTrend(payload);
      const parsed = this.parseAnalysisResponse(generatedText);

      const completedAnalysis: TrendAnalysis = {
        trendId: payload.trendId,
        summary: parsed.summary,
        keyPoints: parsed.keyPoints,
        category: parsed.category,
        sentiment: parsed.sentiment,
        tags: parsed.tags,
        status: 'completed',
        generatedAt: new Date().toISOString(),
      };

      await this.analysisRepository.saveAnalysis(completedAnalysis);

      // Cache in Redis
      const ttl = this.configService.getConfig().redis.cacheTtl;
      await this.redisCacheService.setCachedAnalysis(completedAnalysis, ttl);

      this.logger.log(`Analysis completed for trend "${payload.trendId}"`);
    } catch (error) {
      const failedAnalysis: TrendAnalysis = {
        trendId: payload.trendId,
        summary: '',
        keyPoints: [],
        category: '',
        sentiment: 'neutral',
        tags: [],
        status: 'failed',
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
      await this.analysisRepository.saveAnalysis(failedAnalysis);
      this.logger.error(
        `Analysis failed for trend "${payload.trendId}"`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Get analysis for a trend — checks Redis, then PostgreSQL.
   */
  async getAnalysis(trendId: string): Promise<TrendAnalysis | null> {
    // Check Redis cache first
    const cached = await this.redisCacheService.getCachedAnalysis(trendId);
    if (cached) {
      return cached;
    }

    // Check PostgreSQL
    const fromDb = await this.analysisRepository.getAnalysisByTrendId(trendId);
    if (fromDb) {
      // Populate Redis cache
      const ttl = this.configService.getConfig().redis.cacheTtl;
      await this.redisCacheService.setCachedAnalysis(fromDb, ttl);
      return fromDb;
    }

    return null;
  }

  /**
   * Parse the LLM's JSON response into a TrendAnalysis.
   */
  private parseAnalysisResponse(text: string): {
    summary: string;
    keyPoints: string[];
    category: string;
    sentiment: 'positive' | 'neutral' | 'excited';
    tags: string[];
  } {
    try {
      // Strip any markdown code fences or surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(jsonStr);

      return {
        summary: parsed.summary || '',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        category: parsed.category || 'Other',
        sentiment: ['positive', 'neutral', 'excited'].includes(parsed.sentiment)
          ? parsed.sentiment
          : 'neutral',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      };
    } catch (error) {
      this.logger.warn('Failed to parse LLM response as JSON, using fallback');
      return {
        summary: text.slice(0, 200),
        keyPoints: [],
        category: 'Other',
        sentiment: 'neutral',
        tags: [],
      };
    }
  }
}