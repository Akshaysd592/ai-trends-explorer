import { TrendAnalysis } from '@ai-trend-explorer/shared-types';

export interface GeminiInferenceResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface AnalysisPromptInput {
  title: string;
  description?: string;
  topics?: string[];
  language?: string | null;
  source: string;
}

export type { TrendAnalysis };