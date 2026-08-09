import axios from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { Trend, TrendQuery } from '@ai-trend-explorer/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

export interface TrendsQuery extends Partial<TrendQuery> {
  page?: number;
  limit?: number;
  topic?: string;
  language?: string;
  sort?: 'stars' | 'updated';
}

export interface SearchResponse {
  success: boolean;
  data: Trend[];
  query: string;
  total: number;
  timestamp: string;
}

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

export async function fetchTrendById(id: string): Promise<{ success: boolean; data: Trend }> {
  const response = await axios.get<{ success: boolean; data: Trend }>(`${API_BASE}/api/trends/${id}`);

  return response.data;
}

export function useTrends(query: TrendsQuery = {}, options?: Omit<UseQueryOptions<TrendsResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['trends', query],
    queryFn: () => fetchTrends(query),
    ...options,
  });
}

export function useTrend(id: string, options?: Omit<UseQueryOptions<{ success: boolean; data: Trend }>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['trend', id],
    queryFn: () => fetchTrendById(id),
    enabled: !!id && options?.enabled !== false,
    ...options,
  });
}

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

export function useSearch(query: string, options?: Omit<UseQueryOptions<SearchResponse>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTrends(query),
    enabled: query.trim().length > 0,
    ...options,
  });
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

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await axios.get<DashboardStats>(`${API_BASE}/api/trends/stats`);
  return response.data;
}

export function useDashboardStats(options?: Omit<UseQueryOptions<DashboardStats>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    ...options,
  });
}
