import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { TrendRepository } from '../trend/trend.repository';

@Controller('trends/:id/analysis')
export class AiAnalysisController {
  constructor(
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly trendRepository: TrendRepository,
  ) {}

  @Get()
  async getAnalysis(@Param('id') id: string) {
    // Verify the trend exists
    const trend = await this.trendRepository.getTrendById(id);
    if (!trend) {
      throw new NotFoundException(`Trend with id "${id}" not found`);
    }

    // Check if analysis already exists (Redis or PostgreSQL)
    const existing = await this.aiAnalysisService.getAnalysis(id);
    if (existing) {
      return {
        success: true,
        data: existing,
        timestamp: new Date().toISOString(),
      };
    }

    // No analysis yet — trigger on-demand via Kafka and return pending status
    const pending = await this.aiAnalysisService.requestAnalysis({
      trendId: trend.id,
      title: trend.title,
      description: trend.description,
      topics: trend.topics,
      language: trend.language,
      source: trend.source,
    });

    return {
      success: true,
      data: pending,
      timestamp: new Date().toISOString(),
    };
  }
}