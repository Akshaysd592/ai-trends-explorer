import { Trend } from '@ai-trend-explorer/shared-types';
import { HuggingFaceTrendingItem } from './huggingface.types';

export class HuggingFaceMapper {
  static toTrend(item: HuggingFaceTrendingItem): Trend {
    const { repoData } = item;
    // The API does not provide a 'score' field; derive it from likes
    const score = repoData.likes ?? 0;
    // The API does not provide a 'modelId' field; use 'id' as the model identifier
    const modelId = repoData.id;
    return {
      id: repoData.id,
      title: modelId,
      description: repoData.pipeline_tag ?? undefined,
      source: 'huggingface',
      url: `https://huggingface.co/${modelId}`,
      score,
      language: repoData.library_name ?? null,
      stars: repoData.likes,
      topics: repoData.tags ?? [],
      createdAt: repoData.createdAt,
      updatedAt: repoData.lastModified,
    };
  }
}
