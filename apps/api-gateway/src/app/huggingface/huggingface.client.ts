import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HuggingFaceTrendingResponse } from './huggingface.types';

@Injectable()
export class HuggingFaceClient {
  constructor(private readonly http: HttpService) {}

  async getTrending(limit: number): Promise<HuggingFaceTrendingResponse> {
    try {
      const response = await firstValueFrom(
        this.http.get<HuggingFaceTrendingResponse>(
          'https://huggingface.co/api/trending',
          {
            params: {
              limit: limit ?? 20,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException('HuggingFace API unavailable');
    }
  }
}