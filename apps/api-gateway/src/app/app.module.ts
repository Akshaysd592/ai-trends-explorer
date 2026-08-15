import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { envSchema } from '@ai-trend-explorer/config';
import { ConfigModule as AppConfigModule } from '@ai-trend-explorer/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { HealthService } from './health/health.service';
import { TrendProxyController } from './proxy/trend-proxy.controller';
import { AnalysisProxyController } from './proxy/analysis-proxy.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    HttpModule,
    HealthModule,
    AppConfigModule,
  ],
  controllers: [HealthController, TrendProxyController, AnalysisProxyController],
  providers: [
    AppLoggerService,
    HealthService,
  ],
})
export class AppModule {}
