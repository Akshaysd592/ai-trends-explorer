import { Trend } from '@ai-trend-explorer/shared-types';
import { GithubRepository } from './github.types';

export class GithubMapper {
  static toTrend(repo: GithubRepository): Trend {
    return {
      id: repo.id.toString(),
      title: repo.full_name,
      description: repo.description ?? '',
      source: 'github',
      url: repo.html_url,
      language: repo.language ?? null,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      score: repo.stargazers_count,
      topics: repo.topics ?? [],
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    };
  }
}
