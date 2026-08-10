import type { Trend } from '@ai-trend-explorer/shared-types';

export interface TrendCardProps {
  trend: Trend;
}

export interface TrendDetailPageProps {
  params: Promise<{ id: string }>;
}

export interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}