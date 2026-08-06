
import { Trend } from '@ai-trend-explorer/shared-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendService {
  getTrending(): Trend[] {
    return [
      {
        id: '1',
        title: 'OpenAI releases GPT-5.5',
        source: 'OpenAI',
        score: 98,
        url: 'https://openai.com',
      },
      {
        id: '2',
        title: 'New TypeScript 6 features',
        source: 'TypeScript',
        score: 91,
        url: 'https://www.typescriptlang.org',
      },
    ];
  }
}
