export interface TrendQuery {
  topic: string;
  language?: string;

  page: number;
  limit: number;

  sort: 'stars' | 'updated';
}