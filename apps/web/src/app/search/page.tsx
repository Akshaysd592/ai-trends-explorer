import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TrendCard from '@/components/TrendCard';
import { searchTrends } from '../../lib/trends-api';
import type { SearchPageProps } from '@/lib/types/index';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';

  // Server-side data fetching for SEO
  let results: Awaited<ReturnType<typeof searchTrends>>['data'] = [];
  let total = 0;

  if (query.trim()) {
    const searchResults = await searchTrends(query);
    results = searchResults.data;
    total = searchResults.total;
  }

  return (
    <div className="page">
      <main className="container">
        <div className="search-section">
          <form action="/search" method="GET" className="search-form">
            <Input
              type="text"
              name="q"
              placeholder="Search trends..."
              defaultValue={query}
              className="search-input"
              autoFocus
            />
            <Button type="submit" variant="default">
              Search
            </Button>
          </form>
        </div>

        {query && (
          <div className="search-results-header">
            <h2 className="search-results-title">
              {total > 0
                ? `Found ${total} result${total !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </h2>
          </div>
        )}

        {!query && (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <h2>Start Searching</h2>
            <p>
              Enter a search term to find trending AI projects, tools, and agents.
            </p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">😕</span>
            <h2>No results found</h2>
            <p>
              Try searching with different keywords or browse all trends.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/">View All Trends</a>
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="trends-grid">
            {results.map((trend) => (
              <TrendCard key={`${trend.source}-${trend.id}`} trend={trend} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            AI Trend Explorer — Search across GitHub & Hugging Face
          </p>
        </div>
      </footer>
    </div>
  );
}