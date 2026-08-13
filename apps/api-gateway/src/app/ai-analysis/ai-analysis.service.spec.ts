import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisService } from './ai-analysis.service';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { GeminiInferenceClient } from './ai-analysis.client';
import { AnalysisRepository } from './ai-analysis.repository';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@ai-trend-explorer/config';

describe('AiAnalysisService', () => {
  let service: AiAnalysisService;

  const mockKafkaProducer = {
    publishAnalysisRequest: jest.fn(),
  };

  const mockInferenceClient = {
    analyzeTrend: jest.fn(),
  };

  const mockRepository = {
    saveAnalysis: jest.fn(),
    getAnalysisByTrendId: jest.fn(),
  };

  const mockRedisCacheService = {
    getCachedAnalysis: jest.fn(),
    setCachedAnalysis: jest.fn(),
  };

  const mockConfigService = {
    getConfig: jest.fn().mockReturnValue({
      redis: { cacheTtl: 300 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducer,
        },
        {
          provide: GeminiInferenceClient,
          useValue: mockInferenceClient,
        },
        {
          provide: AnalysisRepository,
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

    service = module.get<AiAnalysisService>(AiAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestAnalysis', () => {
    it('should save a pending record and publish to Kafka', async () => {
      const trend = {
        trendId: '123',
        title: 'Test Trend',
        description: 'A test trend',
        topics: ['ai'],
        language: 'TypeScript',
        source: 'github',
      };

      const result = await service.requestAnalysis(trend);

      expect(result.status).toBe('pending');
      expect(mockRepository.saveAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({ trendId: '123', status: 'pending' }),
      );
      expect(mockKafkaProducer.publishAnalysisRequest).toHaveBeenCalledWith(trend);
    });
  });

  describe('processMessage', () => {
    it('should save completed analysis when LLM succeeds', async () => {
      const payload = {
        trendId: '123',
        title: 'Test Trend',
        source: 'github',
      };

      mockInferenceClient.analyzeTrend.mockResolvedValue(
        JSON.stringify({
          summary: 'A great project',
          keyPoints: ['Point 1', 'Point 2'],
          category: 'Dev Tools',
          sentiment: 'positive',
          tags: ['ai', 'tools'],
        }),
      );

      await service.processMessage(payload);

      expect(mockRepository.saveAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          trendId: '123',
          status: 'completed',
          summary: 'A great project',
          keyPoints: ['Point 1', 'Point 2'],
          category: 'Dev Tools',
          sentiment: 'positive',
          tags: ['ai', 'tools'],
        }),
      );
      expect(mockRedisCacheService.setCachedAnalysis).toHaveBeenCalled();
    });

    it('should save failed analysis when LLM throws', async () => {
      const payload = {
        trendId: '123',
        title: 'Test Trend',
        source: 'github',
      };

      mockInferenceClient.analyzeTrend.mockRejectedValue(
        new Error('Gemini API unavailable'),
      );

      await service.processMessage(payload);

      expect(mockRepository.saveAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          trendId: '123',
          status: 'failed',
          error: 'Gemini API unavailable',
        }),
      );
    });
  });

  describe('getAnalysis', () => {
    it('should return cached analysis from Redis', async () => {
      const cached = {
        trendId: '123',
        status: 'completed',
        summary: 'Cached',
        keyPoints: [],
        category: 'Other',
        sentiment: 'neutral',
        tags: [],
      };

      mockRedisCacheService.getCachedAnalysis.mockResolvedValue(cached);

      const result = await service.getAnalysis('123');

      expect(result).toEqual(cached);
      expect(mockRepository.getAnalysisByTrendId).not.toHaveBeenCalled();
    });

    it('should fetch from DB when Redis cache misses', async () => {
      const fromDb = {
        trendId: '123',
        status: 'completed',
        summary: 'From DB',
        keyPoints: [],
        category: 'Other',
        sentiment: 'neutral',
        tags: [],
      };

      mockRedisCacheService.getCachedAnalysis.mockResolvedValue(null);
      mockRepository.getAnalysisByTrendId.mockResolvedValue(fromDb);

      const result = await service.getAnalysis('123');

      expect(result).toEqual(fromDb);
      expect(mockRedisCacheService.setCachedAnalysis).toHaveBeenCalledWith(
        fromDb,
        300,
      );
    });

    it('should return null when no analysis exists', async () => {
      mockRedisCacheService.getCachedAnalysis.mockResolvedValue(null);
      mockRepository.getAnalysisByTrendId.mockResolvedValue(null);

      const result = await service.getAnalysis('123');

      expect(result).toBeNull();
    });
  });
});