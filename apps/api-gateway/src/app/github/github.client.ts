import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GithubSearchResponse } from './github.types.js';

@Injectable()
export class GithubClient {
  constructor(
    private readonly http: HttpService,
  ) { }

  async searchRepositories(
    query: string,
    page: number,
    limit: number,
    sort: 'stars' | 'updated' = 'stars',
  ): Promise<GithubSearchResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<GithubSearchResponse>(
          'https://api.github.com/search/repositories',
          {
            params: {
              q: query,
              sort,
              order: 'desc',
              per_page: limit ?? 20,
              page,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('Github API unavailable');
    }
  }
}