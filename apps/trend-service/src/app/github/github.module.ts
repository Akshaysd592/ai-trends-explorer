import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@ai-trend-explorer/config';
import { GithubTrendProvider } from './github.provider';
import { GithubClient } from './github.client';
import { AppLoggerService } from '../../logger/app-logger.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [GithubTrendProvider, GithubClient, AppLoggerService],
  exports: [GithubTrendProvider],
})
export class GithubModule {}
