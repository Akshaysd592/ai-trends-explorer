import { Inject, Injectable } from '@nestjs/common';
import { TrendProvider } from '@ai-trend-explorer/shared-types';

export const TREND_PROVIDERS = 'TREND_PROVIDERS';

@Injectable()
export class TrendProviderRegistry {
  constructor(
    @Inject(TREND_PROVIDERS)
    private readonly providers: TrendProvider[],
  ) {}

  getProvider(): TrendProvider[] {
    return this.providers;
  }
}
