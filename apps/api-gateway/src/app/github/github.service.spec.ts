import { Test, TestingModule } from '@nestjs/testing';
import { GithubTrendProvider } from './github.provider';

describe('GithubService', () => {
  let service: GithubTrendProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubTrendProvider],
    }).compile();

    service = module.get<GithubTrendProvider>(GithubTrendProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
