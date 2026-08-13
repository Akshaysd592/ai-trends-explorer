import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@ai-trend-explorer/config';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_CLIENT } from './kafka.constants';

export interface TrendAnalysisRequest {
  trendId: string;
  title: string;
  description?: string;
  topics?: string[];
  language?: string | null;
  source: string;
}

@Injectable()
export class KafkaProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly producer: Producer;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly configService: ConfigService,
  ) {
    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.producer.connect();
        this.logger.log('Kafka producer connected');
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Kafka producer connection attempt ${attempt}/${maxRetries} failed: ${errorMessage}`,
        );
        if (attempt === maxRetries) {
          this.logger.error('Failed to connect to Kafka after maximum retries');
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  async publishAnalysisRequest(trend: TrendAnalysisRequest): Promise<void> {
    const topic = this.configService.getConfig().kafka.topicAnalysisRequest;
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(trend) }],
    });
    this.logger.log(`Published analysis request for trend "${trend.trendId}"`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }
}