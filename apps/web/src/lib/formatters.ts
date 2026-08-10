/**
 * Format a number with compact notation (e.g., 1.2M, 3.4K).
 */
export function formatCompactNumber(num: number | undefined): string {
  if (num === undefined) return 'N/A';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/**
 * Format a number with locale-specific separators (e.g., 1,234,567).
 */
export function formatLocaleNumber(num: number | undefined): string {
  if (num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

/**
 * Format a date string as a short date (e.g., Aug 10, 2026).
 */
export function formatShortDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date string as a long date (e.g., August 10, 2026).
 */
export function formatLongDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}