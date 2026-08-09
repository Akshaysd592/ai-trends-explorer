import { Injectable } from '@nestjs/common';
import { GithubMapper } from './github.mapper';
import { GithubClient } from './github.client';
import { AppLoggerService } from '../../logger/app-logger.service';
import { Trend, TrendProvider, TrendQuery } from '@ai-trend-explorer/shared-types';

@Injectable()
export class GithubTrendProvider implements TrendProvider{

  constructor(private readonly githubClient: GithubClient, private readonly logger: AppLoggerService) { }


  async getTrending(query: TrendQuery): Promise<Trend[]> {
    this.logger.info("searching github repositories")

    const searchQuery =
      `topic:${query.topic}` +
      (query.language
        ? ` language:${query.language}`
        : '');

    const repos = await this.githubClient.searchRepositories(searchQuery, query.page, query.limit);

    this.logger.info("Result obtainer for github repositories")

    return repos.items.map(GithubMapper.toTrend)

  }
}
