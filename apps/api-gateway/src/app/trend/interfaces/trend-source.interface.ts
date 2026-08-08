
import { Trend } from "@ai-trend-explorer/shared-types"

export interface TrendSource{
    getTrending(): Promise<Trend[]>
}