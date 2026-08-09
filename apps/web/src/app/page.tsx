'use client';

import { useState } from 'react';
import TrendCard from './components/TrendCard';
import { useTrends } from '../lib/trends-api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TOPICS = [
  'artificial-intelligence',
  'machine-learning',
  'large-language-models',
  'computer-vision',
  'generative-ai',
  'deep-learning',
  'nlp',
  'robotics',
];

const LANGUAGES = ['', 'Python', 'TypeScript', 'JavaScript', 'Jupyter Notebook', 'Go', 'Rust', 'C++'];

export default function TrendsPage() {
  const [page, setPage] = useState(1);
  const [topic, setTopic] = useState('artificial-intelligence');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState<'stars' | 'updated'>('stars');
  const [limit, setLimit] = useState(12);

  const { data, isLoading, error } = useTrends({ page, limit, topic, language: language || undefined, sort });

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    setPage(1);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setPage(1);
  };

  const handleSortChange = (newSort: 'stars' | 'updated') => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trends = data?.data ?? [];

  return (
    <div className="page">
      <main className="container">
        <div className="filters">
          <div className="filters__group">
            <label className="filters__label">Topic</label>
            <div className="filters__topics">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  className={`filter-pill ${topic === t ? 'filter-pill--active' : ''}`}
                  onClick={() => handleTopicChange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__row">
            <div className="filters__group filters__group--inline">
              <label className="filters__label">Language</label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="filters__select">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang || 'All Languages'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filters__group filters__group--inline">
              <label className="filters__label">Sort By</label>
              <Select value={sort} onValueChange={(value) => handleSortChange(value as 'stars' | 'updated')}>
                <SelectTrigger className="filters__select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Most Stars</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filters__group filters__group--inline">
              <label className="filters__label">Per Page</label>
              <Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
                <SelectTrigger className="filters__select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load trends</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load trends'}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="trends-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <h2>No trends found</h2>
            <p>
              No trending {topic.replace(/-/g, ' ')} projects found
              {language ? ` in ${language}` : ''}. Try a different topic or language.
            </p>
          </div>
        ) : (
          <div className="trends-grid">
            {trends.map((trend) => (
              <TrendCard key={`${trend.source}-${trend.id}`} trend={trend} />
            ))}
          </div>
        )}

        {data && !isLoading && (
          <nav className="pagination" aria-label="Pagination">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              ← Previous
            </Button>
            <span className="pagination__info">
              Page {data.pagination.page}
            </span>
            {/* Show more button since API aggregates fresh each time */}
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={trends.length < limit}
            >
              Next →
            </Button>
          </nav>
        )}

        {data && (
          <p className="updated-at">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            AI Trend Explorer — aggregated from GitHub & Hugging Face
          </p>
        </div>
      </footer>
    </div>
  );
}