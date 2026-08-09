import { Module } from '@nestjs/common';
import { TrendService } from './trend.service';
import { TrendController } from './trend.controller';
import { MockTrendSource } from './sources/mock-trend.source';
import { GithubModule } from '../github/github.module';
import { GithubTrendProvider } from '../github/github.provider';
import { HuggingFaceModule } from '../huggingface/huggingface.module';
import { HuggingFaceTrendProvider } from '../huggingface/huggingface.provider';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { TrendProviderRegistry, TREND_PROVIDERS } from './aggregator/trend.registry';
import { AppLoggerService } from '../../logger/app-logger.service';
import { TrendPersistenceModule } from './trend-persistence.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  providers: [
    TrendService,
    TrendAggregator,
    MockTrendSource,
    TrendProviderRegistry,
    AppLoggerService,
    {
      provide: TREND_PROVIDERS,
      useFactory: (
        githubProvider: GithubTrendProvider,
        huggingFaceProvider: HuggingFaceTrendProvider,
      ) => [githubProvider, huggingFaceProvider],
      inject: [GithubTrendProvider, HuggingFaceTrendProvider],
    },
  ],
  controllers: [TrendController],
  imports: [GithubModule, HuggingFaceModule, TrendPersistenceModule, RedisModule],
})
export class TrendModule {}
