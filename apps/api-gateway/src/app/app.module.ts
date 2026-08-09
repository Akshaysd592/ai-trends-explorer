import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@ai-trend-explorer/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { TrendModule } from './trend/trend.module';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { HealthService } from './health/health.service';
import { MockTrendSource } from './trend/sources/mock-trend.source';
import { GithubTrendProvider } from './github/github.provider';
import { GithubController } from './github/github.controller';
import { GithubModule } from './github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    TrendModule,
    HealthModule,
    GithubModule,
  ],
  controllers: [AppController, HealthController, GithubController],
  providers: [
    AppService,
    AppLoggerService,
    HealthService,
    MockTrendSource,
    
  ],
})
export class AppModule {}
