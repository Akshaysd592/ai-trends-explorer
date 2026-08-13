import type { Trend, TrendAnalysis } from '@ai-trend-explorer/shared-types';

export interface SourceStatus {
  status: 'ok' | 'failed';
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface TrendsResponse {
  success: boolean;
  data: Trend[];
  sources: Record<string, SourceStatus>;
  pagination: Pagination;
  timestamp: string;
}

export interface TrendResponse {
  success: boolean;
  data: Trend;
  timestamp: string;
}

export interface TrendAnalysisResponse {
  success: boolean;
  data: TrendAnalysis;
  timestamp: string;
}

export interface SearchResponse {
  success: boolean;
  data: Trend[];
  query: string;
  total: number;
  timestamp: string;
}

export interface DashboardStats {
  totalTrends: number;
  sources: {
    github: number;
    huggingface: number;
  };
  topLanguages: Array<{ language: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  averageScore: number;
  totalStars: number;
}