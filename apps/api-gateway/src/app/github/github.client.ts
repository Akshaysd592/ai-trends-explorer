import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { GithubSearchResponse } from './github.types.js';

@Injectable()
export class GithubClient {
  constructor(
    private readonly http: HttpService,
  ) {}

  async searchRepositories() {
    const response = await firstValueFrom(
      this.http.get<GithubSearchResponse>(
        'https://api.github.com/search/repositories',
        {
          params: {
            q: 'topic:artificial-intelligence',
            sort: 'stars',
            order: 'desc',
            per_page: 20,
          },
        },
      ),
    );

    return response.data.items;
  }
}