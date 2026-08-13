import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@ai-trend-explorer/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { TrendModule } from './trend/trend.module';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { HealthService } from './health/health.service';
import { MockTrendSource } from './trend/sources/mock-trend.source';
import { GithubController } from './github/github.controller';
import { GithubModule } from './github/github.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    TrendModule,
    HealthModule,
    GithubModule,
    AiAnalysisModule,
  ],
  controllers: [ HealthController, GithubController],
  providers: [
    
    AppLoggerService,
    HealthService,
    MockTrendSource,
    
  ],
})
export class AppModule {}
