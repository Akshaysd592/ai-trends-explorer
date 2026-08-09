import { Test, TestingModule } from '@nestjs/testing';
import { TrendController } from './trend.controller';
import { TrendService } from './trend.service';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { TrendProviderRegistry, TREND_PROVIDERS } from './aggregator/trend.registry';
import { TrendProvider } from '@ai-trend-explorer/shared-types';
import { AppLoggerService } from '../../logger/app-logger.service';
import { TrendRepository } from './trend.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';

describe('TrendController', () => {
  let controller: TrendController;

  const mockRepository = {
    getCachedTrends: jest.fn(),
    getCachedSourceStatuses: jest.fn(),
    saveTrends: jest.fn(),
    saveSourceStatus: jest.fn(),
    getTrendById: jest.fn(),
  };

  const mockRedisCacheService = {
    getCachedTrends: jest.fn(),
    getCachedSourceStatuses: jest.fn(),
    setCachedTrends: jest.fn(),
    setCachedSourceStatuses: jest.fn(),
    clearCache: jest.fn(),
    isConnected: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockConfigService = {
    getConfig: jest.fn().mockReturnValue({
      redis: { cacheTtl: 300 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrendController],
      providers: [
        TrendService,
        TrendAggregator,
        TrendProviderRegistry,
        {
          provide: AppLoggerService,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
            log: jest.fn(),
          },
        },
        {
          provide: TREND_PROVIDERS,
          useValue: [] as TrendProvider[],
        },
        {
          provide: TrendRepository,
          useValue: mockRepository,
        },
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<TrendController>(TrendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
