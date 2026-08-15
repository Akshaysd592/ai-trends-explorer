import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiAnalysisService } from './ai-analysis.service';
import { TrendAnalysisRequest } from '../kafka/kafka.producer.service';
import { ConfigService } from '@ai-trend-explorer/config';

@Controller('trends')
export class AiAnalysisController {
  constructor(
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string) {
    // Verify the trend exists by calling the trend-service
    const trendServiceUrl = this.configService.getConfig().services.trendServiceUrl;
    try {
      await firstValueFrom(
        this.http.get(`${trendServiceUrl}/api/trends/${encodeURIComponent(id)}`),
      );
    } catch (error) {
      throw new NotFoundException(`Trend with id "${id}" not found`);
    }

    // Check if analysis already exists
    const existing = await this.aiAnalysisService.getAnalysis(id);

    if (existing.status === 'pending' || existing.status === 'failed') {
      // Trigger on-demand analysis via Kafka
      const trend = await this.fetchTrendDetails(id, trendServiceUrl);
      if (trend) {
        const request: TrendAnalysisRequest = {
          trendId: id,
          title: trend.title,
          description: trend.description,
          topics: trend.topics,
          language: trend.language,
          source: trend.source,
        };
        return await this.aiAnalysisService.requestAnalysis(request);
      }
    }

    return {
      success: true,
      data: existing,
      timestamp: new Date().toISOString(),
    };
  }

  private async fetchTrendDetails(id: string, trendServiceUrl: string) {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: { title: string; description?: string; topics?: string[]; language?: string | null; source: string } }>(
          `${trendServiceUrl}/api/trends/${encodeURIComponent(id)}`,
        ),
      );
      return response.data.data;
    } catch {
      return null;
    }
  }
}
