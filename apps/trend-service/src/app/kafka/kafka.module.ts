import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@ai-trend-explorer/config';
import { Kafka } from 'kafkajs';
import { KafkaProducerService } from './kafka.producer.service';
import { KAFKA_CLIENT } from './kafka.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: KAFKA_CLIENT,
      useFactory: (configService: ConfigService): Kafka => {
        const config = configService.getConfig();
        return new Kafka({
          clientId: config.kafka.clientId,
          brokers: config.kafka.brokers.split(','),
        });
      },
      inject: [ConfigService],
    },
    KafkaProducerService,
  ],
  exports: [KAFKA_CLIENT, KafkaProducerService],
})
export class KafkaModule {}
