import { TrendAnalysis } from '@ai-trend-explorer/shared-types';

export interface AnalysisResponse {
  success: boolean;
  data: TrendAnalysis;
  timestamp: string;
}
