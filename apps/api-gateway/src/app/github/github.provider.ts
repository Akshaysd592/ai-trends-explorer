import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { GithubSearchResponse } from './github.types';
import { GithubMapper } from './github.mapper';
import { GithubClient } from './github.client';

@Injectable()
export class GithubTrendProvider {

    constructor(private readonly client: GithubClient){}

    async getTrendingRepositories(){
        const repos = await this.client.searchRepositories();

      return repos.map(GithubMapper.toTrend);
    }
}
