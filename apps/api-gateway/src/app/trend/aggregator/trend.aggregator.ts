import { Injectable } from "@nestjs/common";
import { GithubTrendProvider } from "../../github/github.provider";
import { Trend } from "@ai-trend-explorer/shared-types";



@Injectable()
export class TrendAggregator{
    constructor(
        private readonly github: GithubTrendProvider
    ){}

    async getTrending(): Promise<Trend[]>{
        const githubTrends = await this.github.getTrendingRepositories();

        return githubTrends;
    }
}