import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@ai-trend-explorer/config';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { KAFKA_CLIENT } from '../kafka/kafka.constants';
import { AiAnalysisService } from './ai-analysis.service';
import { TrendAnalysisRequest } from '../kafka/kafka.producer.service';
import { Inject } from '@nestjs/common';

@Injectable()
export class AiAnalysisConsumer implements OnModuleInit {
  private readonly logger = new Logger(AiAnalysisConsumer.name);
  private readonly consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly configService: ConfigService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {
    const groupId = this.configService.getConfig().kafka.groupId;
    this.consumer = this.kafka.consumer({ groupId });
  }

  async onModuleInit(): Promise<void> {
    const maxRetries = 5;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.consumer.connect();
        this.logger.log('Kafka consumer connected');
        break;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Kafka consumer connection attempt ${attempt}/${maxRetries} failed: ${errorMessage}`,
        );
        if (attempt === maxRetries) {
          this.logger.error('Failed to connect to Kafka consumer after maximum retries');
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    const config = this.configService.getConfig();
    const topics = [config.kafka.topicAnalysisRequest, config.kafka.topicTrendDiscovered];
    await this.consumer.subscribe({ topics, fromBeginning: false });
    this.logger.log(`Subscribed to Kafka topics: ${topics.join(', ')}`);

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const topic = payload.topic;
    const message = payload.message;
    const value = message.value?.toString();

    if (!value) {
      this.logger.warn('Received empty message from Kafka');
      return;
    }

    try {
      const request: TrendAnalysisRequest = JSON.parse(value);
      this.logger.log(
        `Processing analysis request for trend "${request.trendId}" from topic "${topic}"`,
      );
      await this.aiAnalysisService.processAnalysis(request);
    } catch (error) {
      this.logger.error(
        `Failed to process Kafka message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
