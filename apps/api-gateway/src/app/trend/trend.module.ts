import { Module } from '@nestjs/common';
import { TrendService } from './trend.service';
import { TrendController } from './trend.controller';

@Module({
  providers: [TrendService],
  controllers: [TrendController],
})
export class TrendModule {}
