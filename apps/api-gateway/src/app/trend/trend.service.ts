import { TrendQuery } from '@ai-trend-explorer/shared-types';

import { TrendAggregator } from './aggregator/trend.aggregator';
import { AggregatedTrendResult } from './aggregator/trend.aggregator';

import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendService {
  constructor( private readonly aggregator: TrendAggregator ){}

  async getTrending(query: TrendQuery): Promise<AggregatedTrendResult> {
    return this.aggregator.getTrending(query);
  }
}
