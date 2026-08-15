import { TrendSource } from '../interfaces/trend-source.interface';
import { Trend } from '@ai-trend-explorer/shared-types';

export class MockTrendSource implements TrendSource {
  async getTrending(): Promise<Trend[]> {
    return [];
  }
}
