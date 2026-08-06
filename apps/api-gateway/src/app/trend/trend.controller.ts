import { Controller, Get } from '@nestjs/common';
import { TrendService } from './trend.service.js';

@Controller('trends')
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @Get()
  getTrending() {
    return this.trendService.getTrending();
  }
}