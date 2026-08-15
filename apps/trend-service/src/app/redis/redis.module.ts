import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@ai-trend-explorer/config';
import { Redis } from 'ioredis';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService): Redis => {
        const config = configService.getConfig();
        return new Redis({
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
        });
      },
      inject: [ConfigService],
    },
    RedisCacheService,
  ],
  exports: [RedisCacheService, 'REDIS_CLIENT'],
})
export class RedisModule {}
