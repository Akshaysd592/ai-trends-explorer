/**
 * Trend Service entry point
 * Handles all trend-related operations (GitHub, HuggingFace, aggregation, caching)
 */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { logger } from './logger/logger.js';
import { AppLoggerService } from './logger/app-logger.service';

async function bootstrap() {
  logger.info('Bootstrapping Trend Service');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
    }),
  );
  app.useLogger(app.get(AppLoggerService));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.TREND_SERVICE_PORT || 3002;
  await app.listen(port);
  logger.info(`Trend Service listening on port ${port}`);
  Logger.log(
    `🚀 Trend Service is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
