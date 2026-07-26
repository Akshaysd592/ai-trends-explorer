
import { createLogger } from '@ai-trend-explorer/logger';
import { ConfigService } from '@ai-trend-explorer/config';

const configService = new ConfigService();
const config = configService.getConfig();

export const logger = createLogger('api-gateway', {
  level: config.logger.level,
  pretty: config.logger.pretty,
});