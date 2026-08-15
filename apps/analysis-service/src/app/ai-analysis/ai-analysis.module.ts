import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { GeminiInferenceClient } from './ai-analysis.client';
import { AiAnalysisConsumer } from './ai-analysis.consumer';
import { AnalysisPersistenceModule } from './analysis-persistence.module';
import { RedisModule } from '../redis/redis.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AppLoggerService } from '../../logger/app-logger.service';

@Module({
  imports: [
    HttpModule,
    AnalysisPersistenceModule,
    RedisModule,
    KafkaModule,
  ],
  providers: [
    AiAnalysisService,
    GeminiInferenceClient,
    AiAnalysisConsumer,
    AppLoggerService,
  ],
  controllers: [AiAnalysisController],
})
export class AiAnalysisModule {}
