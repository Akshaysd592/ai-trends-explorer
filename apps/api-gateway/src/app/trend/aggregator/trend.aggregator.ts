import { Injectable } from '@nestjs/common';
import { Trend, TrendQuery } from '@ai-trend-explorer/shared-types';
import { TrendProviderRegistry } from './trend.registry';
import { AppLoggerService } from '../../../logger/app-logger.service';

export interface SourceStatus {
  status: 'ok' | 'failed';
  error?: string;
}

export interface AggregatedTrendResult {
  trends: Trend[];
  sources: Record<string, SourceStatus>;
}

@Injectable()
export class TrendAggregator {
  constructor(
    private readonly registry: TrendProviderRegistry,
    private readonly logger: AppLoggerService,
  ) {}

  async getTrending(query: TrendQuery): Promise<AggregatedTrendResult> {
    const providers = this.registry.getProvider();

    const settled = await Promise.allSettled(
      providers.map((provider) => provider.getTrending(query)),
    );

    const trends: Trend[] = [];
    const sources: Record<string, SourceStatus> = {};

    settled.forEach((result, index) => {
      const provider = providers[index];
      const sourceName = provider.source;

      if (result.status === 'fulfilled') {
        trends.push(...result.value);
        sources[sourceName] = { status: 'ok' };
      } else {
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        this.logger.error(
          `Provider "${sourceName}" failed: ${errorMessage}`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
        sources[sourceName] = { status: 'failed', error: errorMessage };
      }
    });

    // Deduplicate by id
    const seen = new Set<string>();
    const deduplicated = trends.filter((trend) => {
      if (seen.has(trend.id)) {
        return false;
      }
      seen.add(trend.id);
      return true;
    });

    return { trends: deduplicated, sources };
  }
}
