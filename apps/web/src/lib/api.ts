import { TrendsResponse, TrendResponse } from './types';

export interface TrendsQuery {
  page?: number;
  limit?: number;
  topic?: string;
  language?: string;
  sort?: 'stars' | 'updated';
}

export async function fetchTrends(query: TrendsQuery = {}): Promise<TrendsResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.topic) params.set('topic', query.topic);
  if (query.language) params.set('language', query.language);
  if (query.sort) params.set('sort', query.sort);

  const response = await fetch(`/api/trends?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(error.error || 'Failed to fetch trends');
  }

  return response.json();
}

export async function fetchTrendById(id: string): Promise<TrendResponse> {
  const response = await fetch(`/api/trends/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(error.error || 'Failed to fetch trend');
  }

  return response.json();
}