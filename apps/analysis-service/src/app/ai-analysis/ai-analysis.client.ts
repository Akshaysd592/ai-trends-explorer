import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@ai-trend-explorer/config';
import { TrendAnalysis } from '@ai-trend-explorer/shared-types';

@Injectable()
export class GeminiInferenceClient {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateAnalysis(
    trendId: string,
    title: string,
    description?: string,
    topics?: string[],
  ): Promise<TrendAnalysis> {
    try {
      const apiKey = this.configService.getConfig().ai.apiToken;
      const apiUrl = this.configService.getConfig().ai.apiUrl;
      const model = this.configService.getConfig().ai.model;

      const prompt = this.buildPrompt(title, description, topics);

      const response = await firstValueFrom(
        this.http.post<{ candidates: Array<{ content: { parts: Array<{ text: string }> } }> }>(
          `${apiUrl}/models/${model}:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
        ),
      );

      const text = response.data.candidates[0].content.parts[0].text;
      const parsed = this.parseGeminiResponse(text);

      return {
        trendId,
        summary: parsed.summary,
        keyPoints: parsed.keyPoints,
        category: parsed.category,
        sentiment: parsed.sentiment,
        tags: parsed.tags,
        status: 'completed',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException('AI analysis generation failed');
    }
  }

  private buildPrompt(
    title: string,
    description?: string,
    topics?: string[],
  ): string {
    return `Analyze the following AI/ML trend and provide a structured analysis.

Trend Title: ${title}
Description: ${description ?? 'N/A'}
Topics: ${topics?.join(', ') ?? 'N/A'}

Please provide your response in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the trend",
  "sentiment": "positive|neutral|excited",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "category": "The category of the trend",
  "tags": ["tag1", "tag2"]
}`;
  }

  private parseGeminiResponse(text: string): {
    summary: string;
    sentiment: 'positive' | 'neutral' | 'excited';
    keyPoints: string[];
    category: string;
    tags: string[];
  } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary ?? '',
          sentiment: parsed.sentiment ?? 'neutral',
          keyPoints: parsed.keyPoints ?? [],
          category: parsed.category ?? '',
          tags: parsed.tags ?? [],
        };
      }
    } catch {
      // Fall through to default parsing
    }

    return {
      summary: text.substring(0, 500),
      sentiment: 'neutral',
      keyPoints: [],
      category: '',
      tags: [],
    };
  }
}
