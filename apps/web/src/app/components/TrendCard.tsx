'use client';

import Link from 'next/link';
import type { Trend } from '@ai-trend-explorer/shared-types';

interface TrendCardProps {
  trend: Trend;
}

function formatNumber(num: number | undefined): string {
  if (num === undefined) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TrendCard({ trend }: TrendCardProps) {
  const isGithub = trend.source === 'github';
  const isHuggingFace = trend.source === 'huggingface';

  return (
    <Link href={`/trends/${trend.id}`} className="trend-card-link">
      <article className={`trend-card trend-card--${trend.source}`}>
        <div className="trend-card__header">
          <div className="trend-card__source">
            <span
              className={`trend-card__badge trend-card__badge--${trend.source}`}
              title={trend.source}
            >
              {isGithub && (
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              )}
              {isHuggingFace && (
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 4.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM6 5.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM8 12.5c-2.5 0-4.5-1.5-5-3.5h10c-.5 2-2.5 3.5-5 3.5z" />
                </svg>
              )}
              {trend.source}
            </span>
            {trend.language && (
              <span className="trend-card__language">{trend.language}</span>
            )}
          </div>
          <div className="trend-card__score">
            <span className="trend-card__score-label">Score</span>
            <span className="trend-card__score-value">{formatNumber(trend.score)}</span>
          </div>
        </div>

        <h3 className="trend-card__title">
          {trend.title.split('/').pop()}
          <span className="trend-card__full-title">{trend.title}</span>
        </h3>

        {trend.description && (
          <p className="trend-card__description">{trend.description}</p>
        )}

        <div className="trend-card__stats">
          {isGithub && (
            <>
              <div className="trend-card__stat" title="Stars">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                </svg>
                {formatNumber(trend.stars)}
              </div>
              <div className="trend-card__stat" title="Forks">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M5 3.25a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0010.5 8.5h1.378a2.251 2.251 0 110 1.5H10.5A4 4 0 017 6.03v-.658A2.25 2.25 0 015 3.25zm1.5 0a.75.75 0 10-1.5 0 .75.75 0 001.5 0zM13 11a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                </svg>
                {formatNumber(trend.forks)}
              </div>
            </>
          )}
          {trend.updatedAt && (
            <div className="trend-card__stat trend-card__stat--date" title="Updated">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM7.25 3h1.5v5.19l3.28 3.28-1.06 1.06L7.25 9.5V3z" />
              </svg>
              {formatDate(trend.updatedAt)}
            </div>
          )}
        </div>

        {trend.topics && trend.topics.length > 0 && (
          <div className="trend-card__topics">
            {trend.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="trend-card__topic">
                {topic}
              </span>
            ))}
            {trend.topics.length > 3 && (
              <span className="trend-card__topic trend-card__topic--more">
                +{trend.topics.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="trend-card__footer">
          <span className="trend-card__view">View Details →</span>
        </div>
      </article>
    </Link>
  );
}