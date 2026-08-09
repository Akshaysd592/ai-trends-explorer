import { Test, TestingModule } from '@nestjs/testing';
import { GithubTrendProvider } from './github.provider';
import { GithubClient } from './github.client';
import { AppLoggerService } from '../../logger/app-logger.service';

describe('GithubService', () => {
  let service: GithubTrendProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubTrendProvider,
        {
          provide: GithubClient,
          useValue: {
            searchRepositories: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GithubTrendProvider>(GithubTrendProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});