import { Trend } from "./shared-types.js";
import { TrendQuery } from "./trend-query.js";

export interface TrendProvider {
  readonly source: string;
  getTrending(query: TrendQuery): Promise<Trend[]>;
}
