export type AnalysisStatus = 'pending' | 'completed' | 'failed';

export interface TrendAnalysis {
  trendId: string;
  summary: string;
  keyPoints: string[];
  category: string;
  sentiment: 'positive' | 'neutral' | 'excited';
  tags: string[];
  status: AnalysisStatus;
  generatedAt?: string;
  error?: string;
}