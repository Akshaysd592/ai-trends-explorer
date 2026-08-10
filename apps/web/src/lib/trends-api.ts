import axios from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type {
  TrendsResponse,
  TrendResponse,
  SearchResponse,
  DashboardStats,
  TrendsQuery,
} from './types/index';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch a paginated list of trends.
 */
export async function fetchTrends(query: TrendsQuery = {}): Promise<TrendsResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.topic) params.set('topic', query.topic);
  if (query.language) params.set('language', query.language);
  if (query.sort) params.set('sort', query.sort);

  const response = await axios.get<TrendsResponse>(`${API_BASE}/api/trends`, { params });
  return response.data;
}

/**
 * Fetch a single trend by ID.
 */
export async function fetchTrendById(id: string): Promise<TrendResponse> {
  const response = await axios.get<TrendResponse>(`${API_BASE}/api/trends/${id}`);
  return response.data;
}

/**
 * Search trends by query string.
 */
export async function searchTrends(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    return {
      success: true,
      data: [],
      query: '',
      total: 0,
      timestamp: new Date().toISOString(),
    };
  }

  const response = await axios.get<SearchResponse>(`${API_BASE}/api/trends/search`, {
    params: { q: query },
  });
  return response.data;
}

/**
 * Fetch dashboard statistics.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await axios.get<DashboardStats>(`${API_BASE}/api/trends/stats`);
  return response.data;
}

/**
 * React Query hook for paginated trends.
 */
export function useTrends(
  query: TrendsQuery = {},
  options?: Omit<UseQueryOptions<TrendsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['trends', query],
    queryFn: () => fetchTrends(query),
    ...options,
  });
}

/**
 * React Query hook for a single trend.
 */
export function useTrend(
  id: string,
  options?: Omit<UseQueryOptions<TrendResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['trend', id],
    queryFn: () => fetchTrendById(id),
    enabled: !!id && options?.enabled !== false,
    ...options,
  });
}

/**
 * React Query hook for search.
 */
export function useSearch(
  query: string,
  options?: Omit<UseQueryOptions<SearchResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTrends(query),
    enabled: query.trim().length > 0,
    ...options,
  });
}

/**
 * React Query hook for dashboard stats.
 */
export function useDashboardStats(
  options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    ...options,
  });
}