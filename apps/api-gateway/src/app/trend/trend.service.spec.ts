import { Test, TestingModule } from '@nestjs/testing';
import { TrendService } from './trend.service';
import { TrendAggregator } from './aggregator/trend.aggregator';
import { TrendProviderRegistry, TREND_PROVIDERS } from './aggregator/trend.registry';
import { TrendProvider } from '@ai-trend-explorer/shared-types';
import { AppLoggerService } from '../../logger/app-logger.service';

describe('TrendService', () => {
  let service: TrendService;

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
      ],
    }).compile();

    service = module.get<TrendService>(TrendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
