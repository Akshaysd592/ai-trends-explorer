export interface HuggingFaceRepoData {
  id: string;
  author: string;
  lastModified: string;
  private: boolean;
  gated: boolean;
  downloads: number;
  likes: number;
  pipeline_tag: string | null;
  repoType: string;
  numParameters?: number;
  authorData?: Record<string, unknown>;
  availableInferenceProviders?: unknown[];
  isLikedByUser?: boolean;
  // Properties that may exist on some repo types (e.g. spaces) but not others
  modelId?: string;
  sha?: string;
  disabled?: boolean;
  tags?: string[];
  library_name?: string | null;
  createdAt?: string;
  title?: string;
  shortDescription?: string;
  ai_short_description?: string;
  ai_category?: string;
  colorFrom?: string;
  colorTo?: string;
  emoji?: string;
  pinned?: boolean;
  featured?: boolean;
  visibility?: string;
  runtime?: Record<string, unknown>;
  datasetsServerInfo?: Record<string, unknown>;
  isBenchmark?: boolean;
  isTrace?: boolean;
  widgetOutputUrls?: unknown[];
}

export interface HuggingFaceTrendingItem {
  repoData: HuggingFaceRepoData;
  repoType: string;
}

export interface HuggingFaceTrendingResponse {
  recentlyTrending: HuggingFaceTrendingItem[];
}
