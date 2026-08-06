import { Module } from '@nestjs/common';
import { TrendService } from './trend.service';
import { TrendController } from './trend.controller';
import { GithubTrendProvider } from '../github/github.provider';
import { MockTrendSource } from './sources/mock-trend.source';
import { GithubModule } from '../github/github.module';
import { TrendAggregator } from './aggregator/trend.aggregator';

@Module({
  providers: [TrendService, TrendAggregator,MockTrendSource ],
  controllers: [TrendController],
  imports: [GithubModule],
  
})
export class TrendModule {}
