import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TrendRepository } from './trend.repository';
import { TrendEntity } from './entities/trend.entity';
import { SourceEntity } from './entities/source.entity';
import { Trend } from '@ai-trend-explorer/shared-types';

describe('TrendRepository', () => {
  let repository: TrendRepository;
  let trendRepo: jest.Mocked<Repository<TrendEntity>>;
  let sourceRepo: jest.Mocked<Repository<SourceEntity>>;

  const mockTrend: Trend = {
    id: 'test-id-1',
    title: 'Test Trend',
    description: 'A test trend',
    source: 'github',
    url: 'https://github.com/test/repo',
    language: 'TypeScript',
    stars: 100,
    forks: 10,
    score: 100,
    topics: ['ai', 'ml'],
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    trendRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<TrendEntity>>;

    sourceRepo = {
      find: jest.fn(),
      upsert: jest.fn(),
    } as unknown as jest.Mocked<Repository<SourceEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrendRepository,
        {
          provide: getRepositoryToken(TrendEntity),
          useValue: trendRepo,
        },
        {
          provide: getRepositoryToken(SourceEntity),
          useValue: sourceRepo,
        },
      ],
    }).compile();

    repository = module.get<TrendRepository>(TrendRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('saveTrends', () => {
    it('should upsert trends into the database', async () => {
      await repository.saveTrends([mockTrend]);

      expect(trendRepo.upsert).toHaveBeenCalledTimes(1);
      const calls = trendRepo.upsert.mock.calls[0] as unknown as [
        Partial<TrendEntity>[],
        string[],
      ];
      const [entities, conflictPaths] = calls;
      expect(entities).toHaveLength(1);
      expect(entities[0].id).toBe('test-id-1');
      expect(entities[0].title).toBe('Test Trend');
      expect(conflictPaths).toEqual(['id']);
    });

    it('should do nothing when trends array is empty', async () => {
      await repository.saveTrends([]);

      expect(trendRepo.upsert).not.toHaveBeenCalled();
    });
  });

  describe('saveSourceStatus', () => {
    it('should upsert source status', async () => {
      await repository.saveSourceStatus('github', { status: 'ok' });

      expect(sourceRepo.upsert).toHaveBeenCalledTimes(1);
      const calls = sourceRepo.upsert.mock.calls[0] as unknown as [
        Partial<SourceEntity>,
        string[],
      ];
      const [entity, conflictPaths] = calls;
      expect(entity.name).toBe('github');
      expect(entity.status).toBe('ok');
      expect(conflictPaths).toEqual(['name']);
    });

    it('should save error message for failed sources', async () => {
      await repository.saveSourceStatus('huggingface', {
        status: 'failed',
        error: 'API unavailable',
      });

      expect(sourceRepo.upsert).toHaveBeenCalledTimes(1);
      const calls = sourceRepo.upsert.mock.calls[0] as unknown as [
        Partial<SourceEntity>,
        string[],
      ];
      const [entity] = calls;
      expect(entity.status).toBe('failed');
      expect(entity.error).toBe('API unavailable');
    });
  });

  describe('getCachedTrends', () => {
    it('should return mapped trends when cache is fresh', async () => {
      const entity: TrendEntity = {
        id: 'test-id-1',
        title: 'Test Trend',
        description: 'A test trend',
        source: 'github',
        url: 'https://github.com/test/repo',
        language: 'TypeScript',
        stars: 100,
        forks: 10,
        score: 100,
        topics: ['ai', 'ml'],
        createdAt: new Date('2021-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        savedAt: new Date(),
      };
      trendRepo.find.mockResolvedValue([entity]);

      const result = await repository.getCachedTrends();

      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('test-id-1');
      expect(result![0].title).toBe('Test Trend');
      expect(result![0].source).toBe('github');
      expect(result![0].score).toBe(100);
      expect(trendRepo.find).toHaveBeenCalledWith({
        where: { savedAt: MoreThan(expect.any(Date)) },
        order: { score: 'DESC' },
      });
    });

    it('should return null when cache is empty', async () => {
      trendRepo.find.mockResolvedValue([]);

      const result = await repository.getCachedTrends();

      expect(result).toBeNull();
    });
  });

  describe('getCachedSourceStatuses', () => {
    it('should return source statuses as a record', async () => {
      sourceRepo.find.mockResolvedValue([
        { id: '1', name: 'github', status: 'ok', lastChecked: new Date() },
        { id: '2', name: 'huggingface', status: 'failed', error: 'API down', lastChecked: new Date() },
      ]);

      const result = await repository.getCachedSourceStatuses();

      expect(result.github.status).toBe('ok');
      expect(result.huggingface.status).toBe('failed');
      expect(result.huggingface.error).toBe('API down');
    });
  });

  describe('getTrendById', () => {
    it('should return a trend by id', async () => {
      const entity: TrendEntity = {
        id: 'test-id-1',
        title: 'Test Trend',
        description: 'A test trend',
        source: 'github',
        url: 'https://github.com/test/repo',
        language: 'TypeScript',
        stars: 100,
        forks: 10,
        score: 100,
        topics: ['ai', 'ml'],
        createdAt: new Date('2021-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        savedAt: new Date(),
      };
      trendRepo.findOne.mockResolvedValue(entity);

      const result = await repository.getTrendById('test-id-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('test-id-1');
      expect(trendRepo.findOne).toHaveBeenCalledWith({ where: { id: 'test-id-1' } });
    });

    it('should return null when trend is not found', async () => {
      trendRepo.findOne.mockResolvedValue(null);

      const result = await repository.getTrendById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('clearStaleCache', () => {
    it('should delete trends older than TTL', async () => {
      trendRepo.delete.mockResolvedValue({ affected: 5, raw: [] });

      const result = await repository.clearStaleCache();

      expect(result).toBe(5);
      expect(trendRepo.delete).toHaveBeenCalledWith({
        savedAt: MoreThan(expect.any(Date)),
      });
    });
  });
});
