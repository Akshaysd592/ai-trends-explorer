import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
import { TrendRepository } from '../trend/trend.repository';

describe('AiAnalysisController', () => {
  let controller: AiAnalysisController;

  const mockAiAnalysisService = {
    getAnalysis: jest.fn(),
    requestAnalysis: jest.fn(),
  };

  const mockTrendRepository = {
    getTrendById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAnalysisController],
      providers: [
        {
          provide: AiAnalysisService,
          useValue: mockAiAnalysisService,
        },
        {
          provide: TrendRepository,
          useValue: mockTrendRepository,
        },
      ],
    }).compile();

    controller = module.get<AiAnalysisController>(AiAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAnalysis', () => {
    it('should throw NotFoundException when trend does not exist', async () => {
      mockTrendRepository.getTrendById.mockResolvedValue(null);

      await expect(controller.getAnalysis('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return existing analysis when available', async () => {
      const trend = {
        id: '123',
        title: 'Test Trend',
        source: 'github',
        score: 100,
        url: 'https://example.com',
      };
      const analysis = {
        trendId: '123',
        status: 'completed',
        summary: 'Summary',
        keyPoints: [],
        category: 'Other',
        sentiment: 'neutral',
        tags: [],
      };

      mockTrendRepository.getTrendById.mockResolvedValue(trend);
      mockAiAnalysisService.getAnalysis.mockResolvedValue(analysis);

      const result = await controller.getAnalysis('123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(analysis);
      expect(mockAiAnalysisService.requestAnalysis).not.toHaveBeenCalled();
    });

    it('should trigger on-demand analysis and return pending when none exists', async () => {
      const trend = {
        id: '123',
        title: 'Test Trend',
        description: 'A test',
        topics: ['ai'],
        language: 'TypeScript',
        source: 'github',
        score: 100,
        url: 'https://example.com',
      };
      const pending = {
        trendId: '123',
        status: 'pending',
        summary: '',
        keyPoints: [],
        category: '',
        sentiment: 'neutral',
        tags: [],
      };

      mockTrendRepository.getTrendById.mockResolvedValue(trend);
      mockAiAnalysisService.getAnalysis.mockResolvedValue(null);
      mockAiAnalysisService.requestAnalysis.mockResolvedValue(pending);

      const result = await controller.getAnalysis('123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(pending);
      expect(mockAiAnalysisService.requestAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({ trendId: '123' }),
      );
    });
  });
});