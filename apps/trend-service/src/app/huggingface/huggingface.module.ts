import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@ai-trend-explorer/config';
import { HuggingFaceTrendProvider } from './huggingface.provider';
import { HuggingFaceClient } from './huggingface.client';
import { AppLoggerService } from '../../logger/app-logger.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [HuggingFaceTrendProvider, HuggingFaceClient, AppLoggerService],
  exports: [HuggingFaceTrendProvider],
})
export class HuggingFaceModule {}
