import { Trend } from "./shared-types.js";
import { TrendQuery } from "./trend-query.js";

export interface TrendProvider{
    getTrending(query: TrendQuery): Promise<Trend[]>;

}