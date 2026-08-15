import { Injectable, LoggerService } from '@nestjs/common';
import { logger } from './logger';

@Injectable()
export class AppLoggerService implements LoggerService {
  log(message: string) {
    logger.info(message);
  }

  error(message: string, trace?: string) {
    logger.error({ trace }, message);
  }

  warn(message: string) {
    logger.warn(message);
  }

  info(message: string) {
    logger.info(message);
  }

  debug(message: string) {
    logger.debug(message);
  }

  verbose(message: string) {
    logger.trace(message);
  }
}
