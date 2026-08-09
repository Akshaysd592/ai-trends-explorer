import type { Trend } from '@ai-trend-explorer/shared-types';

export interface SourceStatus {
  status: 'ok' | 'failed';
  error?: string;
}

export interface TrendsResponse {
  success: boolean;
  data: Trend[];
  sources: Record<string, SourceStatus>;
  pagination: {
    page: number;
    limit: number;
  };
  timestamp: string;
}

export interface TrendResponse {
  success: boolean;
  data: Trend;
  timestamp: string;
}
