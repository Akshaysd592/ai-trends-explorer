import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GithubSearchResponse } from './github.types.js';
import { LoggerConfig } from '@ai-trend-explorer/logger';
import { GetTrendsQueryDto } from '../trend/dto/get-trends-query.dto.js';

@Injectable()
export class GithubClient {
  constructor(
    private readonly http: HttpService,
  ) { }



  async searchRepositories(query: string, page: number, limit: number): Promise<GithubSearchResponse> {
   
    try {
      const response = await firstValueFrom(
        this.http.get<GithubSearchResponse>(
          'https://api.github.com/search/repositories',
          {
            params: {
              q: query,
              sort: 'stars',
              order: 'desc',
              per_page: limit ?? 20,
              page
            },
          },
        ),
      );

      return response.data;
    } catch (error) {

      throw new ServiceUnavailableException(
        'Github API unavailalble'
      )
    }

  }
}