import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@ai-trend-explorer/config';
import { AnalysisEntity } from './entities/analysis.entity';
import { AnalysisRepository } from './ai-analysis.repository';
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
          entities: [AnalysisEntity],
          synchronize: true,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature([AnalysisEntity]),
  ],
  providers: [AnalysisRepository],
  exports: [AnalysisRepository],
})
export class AnalysisPersistenceModule {}
