/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {logger} from './logger/logger.js'
import { AppLoggerService } from './logger/app-logger.service';

async function bootstrap() {
  logger.info("Bootstarpping API Gateway")
  const app = await NestFactory.create(AppModule,{
    bufferLogs:true,
  }
  );
  app.useLogger(app.get(AppLoggerService));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`API Gateway listening on port ${port}`);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
