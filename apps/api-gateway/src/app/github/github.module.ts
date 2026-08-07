import { Module } from '@nestjs/common';
import {HttpModule} from '@nestjs/axios'
import { GithubTrendProvider } from './github.provider';
import { GithubClient } from './github.client';
import { AppLoggerService } from '../../logger/app-logger.service';

@Module({
    imports:[HttpModule,],
    providers:[GithubTrendProvider, GithubClient, AppLoggerService],
    exports:[GithubTrendProvider]

})
export class GithubModule {}
