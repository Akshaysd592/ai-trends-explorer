import { Controller, Get, Param, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@ai-trend-explorer/config';
import { Response } from 'express';

/**
 * Proxy controller that forwards analysis-related requests to the analysis-service.
 */
@Controller('trends')
export class AnalysisProxyController {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getAnalysisServiceUrl(): string {
    return this.configService.getConfig().services.analysisServiceUrl;
  }

  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string, @Res() res: Response) {
    const url = `${this.getAnalysisServiceUrl()}/api/trends/${encodeURIComponent(id)}/analysis`;
    const response = await firstValueFrom(this.http.get(url));
    res.status(response.status).json(response.data);
  }
}
