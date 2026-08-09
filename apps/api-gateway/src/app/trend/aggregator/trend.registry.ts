import { Injectable } from "@nestjs/common";
import { GithubTrendProvider } from "../../github/github.provider";
import { TrendProvider } from "@ai-trend-explorer/shared-types";



@Injectable()
export class TrendProviderRegistry{
   

    constructor(private readonly github: GithubTrendProvider){}

    getProvider(): TrendProvider[]{
        return [
            this.github
        ]
    }
}