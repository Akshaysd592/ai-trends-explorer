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

  /**
   * Save or update an analysis record.
   */
  async saveAnalysis(analysis: TrendAnalysis): Promise<void> {
    const entity: Partial<AnalysisEntity> = {
      trendId: analysis.trendId,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      category: analysis.category,
      sentiment: analysis.sentiment,
      tags: analysis.tags,
      status: analysis.status,
      generatedAt: analysis.generatedAt
        ? new Date(analysis.generatedAt)
        : undefined,
      error: analysis.error,
    };

    await this.analysisRepo.upsert(entity, ['trendId']);
    this.logger.log(
      `Saved analysis for trend "${analysis.trendId}" (status: ${analysis.status})`,
    );
  }

  /**
   * Fetch an analysis by trend ID.
   */
  async getAnalysisByTrendId(trendId: string): Promise<TrendAnalysis | null> {
    const entity = await this.analysisRepo.findOne({
      where: { trendId },
    });
    if (!entity) return null;
    return this.entityToAnalysis(entity);
  }

  /**
   * Convert an AnalysisEntity to the canonical TrendAnalysis model.
   */
  private entityToAnalysis(entity: AnalysisEntity): TrendAnalysis {
    return {
      trendId: entity.trendId,
      summary: entity.summary ?? '',
      keyPoints: entity.keyPoints ?? [],
      category: entity.category ?? '',
      sentiment: (entity.sentiment as 'positive' | 'neutral' | 'excited') ?? 'neutral',
      tags: entity.tags ?? [],
      status: (entity.status as 'pending' | 'completed' | 'failed') ?? 'pending',
      generatedAt: entity.generatedAt?.toISOString(),
      error: entity.error,
    };
  }
}