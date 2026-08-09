import { Injectable } from '@nestjs/common';
import { HuggingFaceMapper } from './huggingface.mapper';
import { HuggingFaceClient } from './huggingface.client';
import { AppLoggerService } from '../../logger/app-logger.service';
import { Trend, TrendProvider, TrendQuery } from '@ai-trend-explorer/shared-types';

@Injectable()
export class HuggingFaceTrendProvider implements TrendProvider {
  readonly source = 'huggingface';

  constructor(
    private readonly huggingFaceClient: HuggingFaceClient,
    private readonly logger: AppLoggerService,
  ) {}

  async getTrending(query: TrendQuery): Promise<Trend[]> {
    this.logger.info('searching huggingface trending models');

    const response = await this.huggingFaceClient.getTrending(query.limit);

    this.logger.info('Result obtained for huggingface trending models');

    // The API returns all trending items; slice to respect the requested limit
    const items = response.recentlyTrending ?? [];
    const limited = items.slice(0, query.limit);

    return limited.map(HuggingFaceMapper.toTrend);
  }
}
