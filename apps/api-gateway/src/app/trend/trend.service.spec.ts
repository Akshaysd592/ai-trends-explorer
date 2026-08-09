import { Test, TestingModule } from '@nestjs/testing';
import { TrendService } from './trend.service';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { TrendProviderRegistry, TREND_PROVIDERS } from './aggregator/trend.registry';
import { TrendProvider } from '@ai-trend-explorer/shared-types';
import { AppLoggerService } from '../../logger/app-logger.service';
import { TrendRepository } from './trend.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';

describe('TrendService', () => {
  let service: TrendService;

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

    service = module.get<TrendService>(TrendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTrending', () => {
    it('should return cached trends from Redis when cache is fresh', async () => {
      const cachedTrends = [
        { id: '1', title: 'Cached Trend', source: 'github', score: 100, url: 'https://example.com' },
      ];
      const cachedSources = { github: { status: 'ok' } };
      mockRedisCacheService.getCachedTrends.mockResolvedValue(cachedTrends);
      mockRedisCacheService.getCachedSourceStatuses.mockResolvedValue(cachedSources);

      const result = await service.getTrending({
        page: 1,
        limit: 20,
        topic: 'ai',
        sort: 'stars',
      });

      expect(result.trends).toEqual(cachedTrends);
      expect(result.sources).toEqual(cachedSources);
      expect(mockRedisCacheService.getCachedTrends).toHaveBeenCalled();
    });

    it('should return cached trends from PostgreSQL when Redis is empty', async () => {
      const cachedTrends = [
        { id: '1', title: 'Cached Trend', source: 'github', score: 100, url: 'https://example.com' },
      ];
      const cachedSources = { github: { status: 'ok' } };
      mockRedisCacheService.getCachedTrends.mockResolvedValue(null);
      mockRepository.getCachedTrends.mockResolvedValue(cachedTrends);
      mockRepository.getCachedSourceStatuses.mockResolvedValue(cachedSources);

      const result = await service.getTrending({
        page: 1,
        limit: 20,
        topic: 'ai',
        sort: 'stars',
      });

      expect(result.trends).toEqual(cachedTrends);
      expect(result.sources).toEqual(cachedSources);
      expect(mockRepository.getCachedTrends).toHaveBeenCalled();
      expect(mockRedisCacheService.setCachedTrends).toHaveBeenCalled();
    });

    it('should fetch from providers when all caches are empty', async () => {
      mockRedisCacheService.getCachedTrends.mockResolvedValue(null);
      mockRepository.getCachedTrends.mockResolvedValue(null);
      mockRepository.getCachedSourceStatuses.mockResolvedValue({});
      mockRepository.saveTrends.mockResolvedValue(undefined);
      mockRepository.saveSourceStatus.mockResolvedValue(undefined);

      const result = await service.getTrending({
        page: 1,
        limit: 20,
        topic: 'ai',
        sort: 'stars',
      });

      expect(result.trends).toEqual([]);
      expect(result.sources).toEqual({});
      expect(mockRepository.saveTrends).toHaveBeenCalledWith([]);
      expect(mockRedisCacheService.setCachedTrends).toHaveBeenCalled();
    });
  });

  describe('getTrendById', () => {
    it('should return a trend by id', async () => {
      const trend = { id: '1', title: 'Test', source: 'github', score: 100, url: 'https://example.com' };
      mockRepository.getTrendById.mockResolvedValue(trend);

      const result = await service.getTrendById('1');

      expect(result).toEqual(trend);
      expect(mockRepository.getTrendById).toHaveBeenCalledWith('1');
    });

    it('should return null when trend is not found', async () => {
      mockRepository.getTrendById.mockResolvedValue(null);

      const result = await service.getTrendById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
