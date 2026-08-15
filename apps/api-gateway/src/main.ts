/**
 * API Gateway entry point
 * Acts as a lightweight reverse proxy, forwarding requests to:
 *   - trend-service (port 3002) for trend-related operations
 *   - analysis-service (port 3003) for AI analysis operations
 */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { logger } from './logger/logger.js';
import { AppLoggerService } from './logger/app-logger.service';

async function bootstrap() {
  logger.info('Bootstrapping API Gateway');
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
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.info(`API Gateway listening on port ${port}`);
  Logger.log(
    `🚀 API Gateway is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
