import { Controller, Get } from '@nestjs/common';
import { TrendService } from './trend.service.js';

@Controller('trends')
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @Get()
  async getTrending() {
    // return this.trendService.getTrending();


    return {
      success: true,
      data: await this.trendService.getTrending(),
      timestamp: new Date().toISOString(),
    }
  }
}
