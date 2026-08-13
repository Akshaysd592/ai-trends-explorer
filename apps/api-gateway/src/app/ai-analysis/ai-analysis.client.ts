import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@ai-trend-explorer/config';
import {
  GeminiInferenceResponse,
  AnalysisPromptInput,
} from './ai-analysis.types';

@Injectable()
export class GeminiInferenceClient {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeTrend(input: AnalysisPromptInput): Promise<string> {
    const config = this.configService.getConfig();
    const model = config.ai.model;
    const token = config.ai.apiToken;
    const timeout = config.ai.timeout;
    const apiUrl = config.ai.apiUrl;

    const prompt = this.buildPrompt(input);

    try {
      const response = await firstValueFrom(
        this.http.post<GeminiInferenceResponse>(
          `${apiUrl}/models/${model}:generateContent?key=${token}`,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout,
          },
        ),
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text;
    } catch (error) {
      throw new ServiceUnavailableException(
        `Gemini API unavailable for model "${model}"`,
      );
    }
  }

  private buildPrompt(input: AnalysisPromptInput): string {
    const topics = input.topics?.length ? input.topics.join(', ') : 'N/A';
    const description = input.description || 'N/A';
    const language = input.language || 'N/A';

    return `Analyze the following AI trend and provide structured JSON output.

Trend Title: ${input.title}
Description: ${description}
Source: ${input.source}
Language: ${language}
Topics: ${topics}

Return a JSON object exactly in this format:
{
  "summary": "2-3 sentence overview of why this project is significant",
  "keyPoints": ["3-5 bullet points highlighting key capabilities or innovations"],
  "category": "one category from: LLM, Computer Vision, AI Agents, Dev Tools, ML Infrastructure, Audio, Multimodal, Other",
  "sentiment": "one of: positive, neutral, excited",
  "tags": ["3-5 short relevant tags"]
}

Return ONLY the JSON object, no other text.`;
  }
}