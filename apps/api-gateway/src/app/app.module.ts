import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@ai-trend-explorer/config';
import { AppLoggerService } from '../logger/app-logger.service';
import { TrendModule } from './trend/trend.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    TrendModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLoggerService],
})
export class AppModule {}
