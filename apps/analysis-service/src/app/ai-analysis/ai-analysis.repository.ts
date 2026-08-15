import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrendAnalysis } from '@ai-trend-explorer/shared-types';
import { AnalysisEntity } from './entities/analysis.entity';

@Injectable()
export class AnalysisRepository {
  private readonly logger = new Logger(AnalysisRepository.name);

  constructor(
    @InjectRepository(AnalysisEntity)
    private readonly analysisRepo: Repository<AnalysisEntity>,
  ) {}

  async saveAnalysis(analysis: TrendAnalysis): Promise<void> {
    await this.analysisRepo.upsert(
      {
        trendId: analysis.trendId,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        keyPoints: analysis.keyPoints,
        category: analysis.category,
        tags: analysis.tags,
        status: analysis.status,
        error: analysis.error ?? undefined,
        generatedAt: analysis.generatedAt ? new Date(analysis.generatedAt) : undefined,
      },
      ['trendId'],
    );
    this.logger.log(`Saved analysis for trend "${analysis.trendId}"`);
  }

  async getAnalysisByTrendId(trendId: string): Promise<TrendAnalysis | null> {
    const entity = await this.analysisRepo.findOne({ where: { trendId } });
    if (!entity) return null;
    return this.entityToAnalysis(entity);
  }

  async savePendingAnalysis(trendId: string): Promise<void> {
    await this.analysisRepo.upsert(
      {
        trendId,
        summary: '',
        status: 'pending',
      },
      ['trendId'],
    );
    this.logger.log(`Saved pending analysis for trend "${trendId}"`);
  }

  private entityToAnalysis(entity: AnalysisEntity): TrendAnalysis {
    return {
      trendId: entity.trendId,
      summary: entity.summary,
      keyPoints: entity.keyPoints ?? [],
      category: entity.category ?? '',
      sentiment: (entity.sentiment as 'positive' | 'neutral' | 'excited') ?? 'neutral',
      tags: entity.tags ?? [],
      status: entity.status as 'pending' | 'completed' | 'failed',
      error: entity.error ?? undefined,
      generatedAt: entity.generatedAt?.toISOString(),
    };
  }
}
