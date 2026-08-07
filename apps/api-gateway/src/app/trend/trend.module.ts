import { Module } from '@nestjs/common';
import { TrendService } from './trend.service';
import { TrendController } from './trend.controller';
import { MockTrendSource } from './sources/mock-trend.source';
import { GithubModule } from '../github/github.module';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { TrendProviderRegistry } from './aggregator/trend.registry';

@Module({
  providers: [TrendService, TrendAggregator,MockTrendSource,TrendProviderRegistry ],
  controllers: [TrendController],
  imports: [GithubModule],
  
})
export class TrendModule {}
