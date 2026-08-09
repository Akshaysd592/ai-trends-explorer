'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchTrendById } from '../../../lib/api';
import type { Trend } from '@ai-trend-explorer/shared-types';

function formatNumber(num: number | undefined): string {
  if (num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TrendDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTrendById(id);
        setTrend(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trend');
      } finally {
        setLoading(false);
      }
    };

    loadTrend();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="trend-card-skeleton" style={{ height: 400, marginTop: '2rem' }}>
            <div className="skeleton skeleton--badge" style={{ width: 140, height: 28 }} />
            <div className="skeleton skeleton--title" style={{ width: '60%', height: 32 }} />
            <div className="skeleton skeleton--desc" style={{ width: '95%', height: 16 }} />
            <div className="skeleton skeleton--desc" style={{ width: '85%', height: 16 }} />
            <div className="skeleton skeleton--desc" style={{ width: '90%', height: 16 }} />
            <div className="skeleton skeleton--stats" style={{ width: '50%', height: 20 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !trend) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '5rem' }}>
            <span className="empty-state__icon">😕</span>
            <h2>Trend not found</h2>
            <p>{error || 'The requested trend could not be found.'}</p>
            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="detail-card__button detail-card__button--primary"
                onClick={() => router.push('/')}
              >
                ← Back to Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGithub = trend.source === 'github';

  return (
    <div className="detail-page">
      <header className="header">
        <div className="container">
          <div className="header__inner">
            <Link href="/" className="detail-back">
              ← Back to Trends
            </Link>
            <span className="source-chip source-chip--ok">
              <span className="source-chip__dot" />
              {trend.source}
            </span>
          </div>
        </div>
      </header>

      <main className="container">
        <article className={`detail-card detail-card--${trend.source}`}>
          <div className="detail-card__header">
            <div className="detail-card__badges">
              <span className={`detail-card__badge detail-card__badge--${trend.source}`}>
                {trend.source}
              </span>
              {trend.language && (
                <span className="detail-card__language">{trend.language}</span>
              )}
            </div>
            <div className="detail-card__score">
              <span className="detail-card__score-label">Trend Score</span>
              <span className="detail-card__score-value">{formatNumber(trend.score)}</span>
            </div>
          </div>

          <h1 className="detail-card__title">{trend.title}</h1>

          {trend.description && (
            <p className="detail-card__description">{trend.description}</p>
          )}

          <div className="detail-card__stats">
            {isGithub ? (
              <>
                <div className="detail-card__stat">
                  <span className="detail-card__stat-label">⭐ Stars</span>
                  <span className="detail-card__stat-value">{formatNumber(trend.stars)}</span>
                </div>
                <div className="detail-card__stat">
                  <span className="detail-card__stat-label">🍴 Forks</span>
                  <span className="detail-card__stat-value">{formatNumber(trend.forks)}</span>
                </div>
              </>
            ) : (
              <div className="detail-card__stat">
                <span className="detail-card__stat-label">💯 Score</span>
                <span className="detail-card__stat-value">{formatNumber(trend.score)}</span>
              </div>
            )}
            <div className="detail-card__stat">
              <span className="detail-card__stat-label">📅 Created</span>
              <span className="detail-card__stat-value">{formatDate(trend.createdAt)}</span>
            </div>
            <div className="detail-card__stat">
              <span className="detail-card__stat-label">🕐 Updated</span>
              <span className="detail-card__stat-value">{formatDate(trend.updatedAt)}</span>
            </div>
          </div>

          {trend.topics && trend.topics.length > 0 && (
            <div className="detail-card__topics">
              <h2 className="detail-card__topics-title">Topics</h2>
              <div className="detail-card__topics-list">
                {trend.topics.map((topic) => (
                  <span key={topic} className="detail-card__topic">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-card__actions">
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-card__button detail-card__button--primary"
            >
              View on {isGithub ? 'GitHub' : 'Hugging Face'} ↗
            </a>
            <button
              className="detail-card__button detail-card__button--secondary"
              onClick={() => router.push('/')}
            >
              ← All Trends
            </button>
          </div>
        </article>

        <div className="detail-meta">
          <span>ID: {trend.id}</span>
          <span>Source: {trend.source}</span>
        </div>
      </main>
    </div>
  );
}