import { Injectable } from "@nestjs/common";
import { Trend, TrendQuery } from "@ai-trend-explorer/shared-types";
import { TrendProviderRegistry } from "./trend.registry";



@Injectable()
export class TrendAggregator{
    constructor(
        private readonly registry: TrendProviderRegistry
    ){}

  

    async getTrending(query: TrendQuery): Promise<Trend[]>{
         const providers = this.registry.getProvider();

         const result = await Promise.all(
            providers.map(provider => provider.getTrending(query)),
         )

        return result.flat();
    }
}