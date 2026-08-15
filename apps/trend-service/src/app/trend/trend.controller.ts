import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { TrendService } from './trend.service';

@Controller('trends')
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @Get()
  async getTrending(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('topic') topic?: string,
    @Query('language') language?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = parseInt(page ?? '1', 10);
    const limitNum = parseInt(limit ?? '20', 10);

    const { trends, sources } = await this.trendService.getTrending({
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 20 : limitNum,
      topic: topic ?? 'artificial-intelligence',
      language,
      sort: sort === 'updated' ? 'updated' : 'stars',
    });

    return {
      success: true,
      data: trends,
      sources,
      pagination: {
        page: isNaN(pageNum) ? 1 : pageNum,
        limit: isNaN(limitNum) ? 20 : limitNum,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  async searchTrends(@Query('q') query: string) {
    const trends = await this.trendService.searchTrends(query || '');
    return {
      success: true,
      data: trends,
      query: query || '',
      total: trends.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  async getDashboardStats() {
    const stats = await this.trendService.getDashboardStats();
    return stats;
  }

  @Get(':id')
  async getTrendById(@Param('id') id: string) {
    const trend = await this.trendService.getTrendById(id);
    if (!trend) {
      throw new NotFoundException(`Trend with id "${id}" not found`);
    }
    return {
      success: true,
      data: trend,
      timestamp: new Date().toISOString(),
    };
  }
}
