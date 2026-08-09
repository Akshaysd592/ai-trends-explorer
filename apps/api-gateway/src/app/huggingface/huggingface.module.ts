import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HuggingFaceTrendProvider } from './huggingface.provider';
import { HuggingFaceClient } from './huggingface.client';
import { AppLoggerService } from '../../logger/app-logger.service';

@Module({
  imports: [HttpModule],
  providers: [HuggingFaceTrendProvider, HuggingFaceClient, AppLoggerService],
  exports: [HuggingFaceTrendProvider],
})
export class HuggingFaceModule {}