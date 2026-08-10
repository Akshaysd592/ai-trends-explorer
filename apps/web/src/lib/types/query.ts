import type { TrendQuery } from '@ai-trend-explorer/shared-types';

export type SortOrder = 'stars' | 'updated';

export interface TrendsQuery extends Partial<TrendQuery> {
  page?: number;
  limit?: number;
  topic?: string;
  language?: string;
  sort?: SortOrder;
}