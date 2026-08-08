import { TrendSource } from "../interfaces/trend-source.interface";
import { Trend } from "@ai-trend-explorer/shared-types";




export class MockTrendSource implements TrendSource {
   async getTrending(): Promise<Trend[]> {
        return [
    //          {
    //     id: '1',
    //     title: 'OpenAI releases GPT-5.5',
    //     source: 'OpenAI',
    //     score: 98,
    //     url: 'https://openai.com',
    //   },
    //   {
    //     id: '2',
    //     title: 'New TypeScript 6 features',
    //     source: 'TypeScript',
    //     score: 91,
    //     url: 'https://www.typescriptlang.org',
    //   }
        ];
    }
    
}