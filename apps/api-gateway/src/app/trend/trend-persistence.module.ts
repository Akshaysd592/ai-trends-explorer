import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@ai-trend-explorer/config';
import { TrendEntity } from './entities/trend.entity';
import { SourceEntity } from './entities/source.entity';
import { AnalysisEntity } from '../ai-analysis/entities/analysis.entity';
import { TrendRepository } from './trend.repository';
import pg from 'pg';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.getConfig();
        const db = config.database;
        return {
          type: 'postgres' as const,
          driver: pg,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          entities: [TrendEntity, SourceEntity, AnalysisEntity],
          synchronize: true,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature([TrendEntity, SourceEntity]),
  ],
  providers: [TrendRepository],
  exports: [TrendRepository],
})
export class TrendPersistenceModule {}
