import { Test, TestingModule } from '@nestjs/testing';
import { TrendAggregator } from './trend.aggregator';
import { TrendProviderRegistry, TREND_PROVIDERS } from './trend.registry';
import { TrendProvider, Trend, TrendQuery } from '@ai-trend-explorer/shared-types';
import { AppLoggerService } from '../../../logger/app-logger.service';

describe('TrendAggregator', () => {
  let aggregator: TrendAggregator;
  let registry: TrendProviderRegistry;
  let logger: { info: jest.Mock; error: jest.Mock; warn: jest.Mock; debug: jest.Mock; verbose: jest.Mock; log: jest.Mock };

  const mockQuery: TrendQuery = {
    page: 1,
    limit: 20,
    topic: 'artificial-intelligence',
    language: undefined,
    sort: 'stars',
  };

  const mockTrend: Trend = {
    id: '1',
    title: 'Test Trend',
    source: 'github',
    url: 'https://example.com',
    score: 100,
  };

  function createMockProvider(source: string, trends: Trend[], shouldFail = false): TrendProvider {
    return {
      source,
      getTrending: shouldFail
        ? jest.fn().mockRejectedValue(new Error(`${source} API unavailable`))
        : jest.fn().mockResolvedValue(trends),
    };
  }

  beforeEach(async () => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrendAggregator,
        TrendProviderRegistry,
        {
          provide: AppLoggerService,
          useValue: logger,
        },
        {
          provide: TREND_PROVIDERS,
          useValue: [] as TrendProvider[],
        },
      ],
    }).compile();

    aggregator = module.get<TrendAggregator>(TrendAggregator);
    registry = module.get<TrendProviderRegistry>(TrendProviderRegistry);
  });

  it('should be defined', () => {
    expect(aggregator).toBeDefined();
  });

  describe('when all providers succeed', () => {
    beforeEach(() => {
      const providers = [
        createMockProvider('github', [mockTrend]),
        createMockProvider('huggingface', [{ ...mockTrend, id: '2', source: 'huggingface' }]),
      ];
      jest.spyOn(registry, 'getProvider').mockReturnValue(providers);
    });

    it('should return trends from all providers', async () => {
      const result = await aggregator.getTrending(mockQuery);

      expect(result.trends).toHaveLength(2);
      expect(result.sources.github.status).toBe('ok');
      expect(result.sources.huggingface.status).toBe('ok');
    });
  });

  describe('when one provider fails', () => {
    beforeEach(() => {
      const providers = [
        createMockProvider('github', [mockTrend], true),
        createMockProvider('huggingface', [{ ...mockTrend, id: '2', source: 'huggingface' }]),
      ];
      jest.spyOn(registry, 'getProvider').mockReturnValue(providers);
    });

    it('should return trends from the successful provider only', async () => {
      const result = await aggregator.getTrending(mockQuery);

      expect(result.trends).toHaveLength(1);
      expect(result.trends[0].source).toBe('huggingface');
    });

    it('should mark the failed provider as failed with error message', async () => {
      const result = await aggregator.getTrending(mockQuery);

      expect(result.sources.github.status).toBe('failed');
      expect(result.sources.github.error).toContain('github API unavailable');
      expect(result.sources.huggingface.status).toBe('ok');
    });

    it('should log the error for the failed provider', async () => {
      await aggregator.getTrending(mockQuery);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('github'),
        expect.anything(),
      );
    });
  });

  describe('when all providers fail', () => {
    beforeEach(() => {
      const providers = [
        createMockProvider('github', [], true),
        createMockProvider('huggingface', [], true),
      ];
      jest.spyOn(registry, 'getProvider').mockReturnValue(providers);
    });

    it('should return an empty trends array', async () => {
      const result = await aggregator.getTrending(mockQuery);

      expect(result.trends).toHaveLength(0);
    });

    it('should mark all sources as failed', async () => {
      const result = await aggregator.getTrending(mockQuery);

      expect(result.sources.github.status).toBe('failed');
      expect(result.sources.huggingface.status).toBe('failed');
    });

    it('should not throw an error', async () => {
      await expect(aggregator.getTrending(mockQuery)).resolves.not.toThrow();
    });
  });

  describe('deduplication', () => {
    it('should deduplicate trends with the same id', async () => {
      const providers = [
        createMockProvider('github', [mockTrend, { ...mockTrend, title: 'Duplicate' }]),
        createMockProvider('huggingface', [{ ...mockTrend, source: 'huggingface' }]),
      ];
      jest.spyOn(registry, 'getProvider').mockReturnValue(providers);

      const result = await aggregator.getTrending(mockQuery);

      expect(result.trends).toHaveLength(1);
    });
  });
});
