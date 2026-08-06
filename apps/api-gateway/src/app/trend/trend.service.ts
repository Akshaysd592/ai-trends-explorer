
import { GithubTrendProvider } from '../github/github.provider';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { MockTrendSource } from './sources/mock-trend.source';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendService {
  constructor( private readonly aggregator: TrendAggregator ){}

  async getTrending() {
    // return  this.trendService.getTrending();
    return this.aggregator.getTrending();
  }
}
