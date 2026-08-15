import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@ai-trend-explorer/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { HealthService } from './health/health.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    AiAnalysisModule,
    HealthModule,
  ],
  controllers: [HealthController],
  providers: [
    AppLoggerService,
    HealthService,
  ],
})
export class AppModule {}
