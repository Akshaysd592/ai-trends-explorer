import { Test, TestingModule } from '@nestjs/testing';
import { HuggingFaceTrendProvider } from './huggingface.provider';
import { HuggingFaceClient } from './huggingface.client';
import { AppLoggerService } from '../../logger/app-logger.service';
import { HuggingFaceTrendingResponse } from './huggingface.types';
import { TrendQuery } from '@ai-trend-explorer/shared-types';

describe('HuggingFaceTrendProvider', () => {
  let provider: HuggingFaceTrendProvider;
  let client: { getTrending: jest.Mock };

  const mockQuery: TrendQuery = {
    page: 1,
    limit: 10,
    topic: 'artificial-intelligence',
    language: undefined,
    sort: 'stars',
  };

  const mockResponse: HuggingFaceTrendingResponse = {
    recentlyTrending: [
      {
        repoData: {
          id: 'MiniMaxAI/MiniMax-H3',
          author: 'MiniMaxAI',
          lastModified: '2026-08-06T16:07:09.000Z',
          private: false,
          gated: false,
          downloads: 26693,
          likes: 3023,
          pipeline_tag: 'image-text-to-video',
          repoType: 'model',
          numParameters: 33122992896,
        },
        repoType: 'model',
      },
      {
        repoData: {
          id: 'deepseek-ai/DeepSeek-V4-Flash-0731',
          author: 'deepseek-ai',
          lastModified: '2026-08-01T03:07:41.000Z',
          private: false,
          gated: false,
          downloads: 785771,
          likes: 2795,
          pipeline_tag: 'text-generation',
          repoType: 'model',
          numParameters: 304180418494,
        },
        repoType: 'model',
      },
    ],
  };

  beforeEach(async () => {
    client = {
      getTrending: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HuggingFaceTrendProvider,
        {
          provide: HuggingFaceClient,
          useValue: client,
        },
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
      ],
    }).compile();

    provider = module.get<HuggingFaceTrendProvider>(HuggingFaceTrendProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should have source "huggingface"', () => {
    expect(provider.source).toBe('huggingface');
  });

  describe('getTrending', () => {
    it('should return mapped trends from the API response', async () => {
      client.getTrending.mockResolvedValue(mockResponse);

      const result = await provider.getTrending(mockQuery);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('MiniMaxAI/MiniMax-H3');
      expect(result[0].title).toBe('MiniMaxAI/MiniMax-H3');
      expect(result[0].source).toBe('huggingface');
      expect(result[0].url).toBe('https://huggingface.co/MiniMaxAI/MiniMax-H3');
      expect(result[0].score).toBe(3023);
      expect(result[0].stars).toBe(3023);
      expect(result[0].description).toBe('image-text-to-video');
      expect(result[0].language).toBeNull();
      expect(result[0].topics).toEqual([]);
      expect(result[0].updatedAt).toBe('2026-08-06T16:07:09.000Z');
    });

    it('should respect the limit parameter by slicing results', async () => {
      const largeResponse: HuggingFaceTrendingResponse = {
        recentlyTrending: Array.from({ length: 30 }, (_, i) => ({
          repoData: {
            id: `model-${i}`,
            author: 'author',
            lastModified: '2026-08-06T16:07:09.000Z',
            private: false,
            gated: false,
            downloads: 100,
            likes: 50,
            pipeline_tag: 'text-generation',
            repoType: 'model',
          },
          repoType: 'model',
        })),
      };
      client.getTrending.mockResolvedValue(largeResponse);

      const result = await provider.getTrending(mockQuery);

      expect(result).toHaveLength(10);
    });

    it('should handle items with tags and library_name', async () => {
      const responseWithTags: HuggingFaceTrendingResponse = {
        recentlyTrending: [
          {
            repoData: {
              id: 'some/model',
              author: 'some',
              lastModified: '2026-08-06T16:07:09.000Z',
              private: false,
              gated: false,
              downloads: 100,
              likes: 50,
              pipeline_tag: 'text-generation',
              repoType: 'model',
              tags: ['pytorch', 'nlp'],
              library_name: 'transformers',
              createdAt: '2021-05-09T11:48:37Z',
            },
            repoType: 'model',
          },
        ],
      };
      client.getTrending.mockResolvedValue(responseWithTags);

      const result = await provider.getTrending(mockQuery);

      expect(result[0].topics).toEqual(['pytorch', 'nlp']);
      expect(result[0].language).toBe('transformers');
      expect(result[0].createdAt).toBe('2021-05-09T11:48:37Z');
    });

    it('should handle empty recentlyTrending array', async () => {
      client.getTrending.mockResolvedValue({ recentlyTrending: [] });

      const result = await provider.getTrending(mockQuery);

      expect(result).toEqual([]);
    });

    it('should handle undefined recentlyTrending gracefully', async () => {
      client.getTrending.mockResolvedValue({} as HuggingFaceTrendingResponse);

      const result = await provider.getTrending(mockQuery);

      expect(result).toEqual([]);
    });

    it('should derive score from likes when score is not provided', async () => {
      client.getTrending.mockResolvedValue(mockResponse);

      const result = await provider.getTrending(mockQuery);

      expect(result[0].score).toBe(result[0].stars);
    });
  });
});
