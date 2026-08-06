import { Module } from '@nestjs/common';
import {HttpModule} from '@nestjs/axios'
import { GithubTrendProvider } from './github.provider';
import { GithubClient } from './github.client';

@Module({
    imports:[HttpModule],
    providers:[GithubTrendProvider, GithubClient],
    exports:[GithubTrendProvider]

})
export class GithubModule {}
