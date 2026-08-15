import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@ai-trend-explorer/config';
import { Response } from 'express';

/**
 * Proxy controller that forwards trend-related requests to the trend-service.
 * This keeps the API gateway as a lightweight reverse proxy.
 */
@Controller('trends')
export class TrendProxyController {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getTrendServiceUrl(): string {
    return this.configService.getConfig().services.trendServiceUrl;
  }

  @Get()
  async getTrending(@Query() query: Record<string, string>, @Res() res: Response) {
    const url = `${this.getTrendServiceUrl()}/api/trends`;
    const response = await firstValueFrom(
      this.http.get(url, { params: query }),
    );
    res.status(response.status).json(response.data);
  }

  @Get('search')
  async searchTrends(@Query('q') q: string, @Res() res: Response) {
    const url = `${this.getTrendServiceUrl()}/api/trends/search`;
    const response = await firstValueFrom(
      this.http.get(url, { params: { q } }),
    );
    res.status(response.status).json(response.data);
  }

  @Get('stats')
  async getStats(@Res() res: Response) {
    const url = `${this.getTrendServiceUrl()}/api/trends/stats`;
    const response = await firstValueFrom(this.http.get(url));
    res.status(response.status).json(response.data);
  }

  @Get(':id')
  async getTrendById(@Param('id') id: string, @Res() res: Response) {
    const url = `${this.getTrendServiceUrl()}/api/trends/${encodeURIComponent(id)}`;
    const response = await firstValueFrom(this.http.get(url));
    res.status(response.status).json(response.data);
  }
}
