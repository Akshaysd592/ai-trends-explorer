import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { KafkaModule } from '../kafka/kafka.module';
import { RedisModule } from '../redis/redis.module';
import { TrendPersistenceModule } from '../trend/trend-persistence.module';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisConsumer } from './ai-analysis.consumer';
import { AiAnalysisController } from './ai-analysis.controller';
import { GeminiInferenceClient } from './ai-analysis.client';
import { AnalysisRepository } from './ai-analysis.repository';
import { AnalysisEntity } from './entities/analysis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisEntity]),
    HttpModule,
    KafkaModule,
    RedisModule,
    TrendPersistenceModule,
  ],
  controllers: [AiAnalysisController],
  providers: [
    AiAnalysisService,
    AiAnalysisConsumer,
    GeminiInferenceClient,
    AnalysisRepository,
  ],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}