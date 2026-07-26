import pino, { Logger } from 'pino';
import { LoggerConfig } from './logger.types.js';

export function createLogger(
  serviceName: string,
  config: LoggerConfig,
): Logger {
  return pino({
    level: config.level ?? 'info',
    base: {
      service: serviceName,
    },
    timestamp: pino.stdTimeFunctions.isoTime,

    redact: {
      paths: ['password', 'token', 'authorization', 'headers.authorization'],
      censor: '[REDACTED]',
    },
    transport: config.pretty?
    {
      target: 'pino-pretty',
      options:{
        colorize: true,
        translateTime: 'SYS:standard',
        ignore:'pid, hostname',
      }
    }: undefined
  });
}
