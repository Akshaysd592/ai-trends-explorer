import { Controller, Get, Query } from '@nestjs/common';
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
}
