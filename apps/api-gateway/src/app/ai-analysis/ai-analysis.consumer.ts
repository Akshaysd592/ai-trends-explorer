import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@ai-trend-explorer/config';
import { Consumer, Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from '../kafka/kafka.constants';
import { AiAnalysisService } from './ai-analysis.service';
import { TrendAnalysisRequest } from '../kafka/kafka.producer.service';

@Injectable()
export class AiAnalysisConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiAnalysisConsumer.name);
  private readonly consumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly configService: ConfigService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {
    const config = this.configService.getConfig();
    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
    });
  }

  async onModuleInit(): Promise<void> {
    const topic = this.configService.getConfig().kafka.topicAnalysisRequest;
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Connect consumer
        await this.consumer.connect();
        this.logger.log('Kafka consumer connected');

        // Subscribe to topic
        await this.consumer.subscribe({ topic, fromBeginning: false });
        this.logger.log(`Kafka consumer subscribed to topic "${topic}"`);

        // Start consuming
        await this.consumer.run({
          eachMessage: async ({ topic: messageTopic, partition, message }) => {
            const value = message.value?.toString();
            if (!value) return;

            this.logger.log(
              `Received message from topic "${messageTopic}" (partition ${partition})`,
            );

            try {
              const payload = JSON.parse(value) as TrendAnalysisRequest;
              await this.aiAnalysisService.processMessage(payload);
            } catch (error) {
              this.logger.error(
                'Failed to process Kafka message',
                error instanceof Error ? error.stack : error,
              );
            }
          },
        });

        this.logger.log(`Kafka consumer started for topic "${topic}"`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Kafka consumer connection attempt ${attempt}/${maxRetries} failed: ${errorMessage}`,
        );
        if (attempt === maxRetries) {
          this.logger.error('Failed to connect Kafka consumer after maximum retries');
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }
}