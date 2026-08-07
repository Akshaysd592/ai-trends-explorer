export interface Trend {
  id: string;

  title: string;

  description?: string;

  source: 'github' | 'huggingface' | 'producthunt';

  url: string;

  score: number;

  language?: string | null;

  stars?: number;

  forks?: number;

  topics?: string[];

  createdAt?: string;

  updatedAt?: string;
}