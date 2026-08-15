import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@ai-trend-explorer/config';
import { HuggingFaceTrendingResponse } from './huggingface.types';

@Injectable()
export class HuggingFaceClient {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTrending(limit: number): Promise<HuggingFaceTrendingResponse> {
    try {
      const apiUrl = this.configService.getHuggingFaceApiUrl();
      const response = await firstValueFrom(
        this.http.get<HuggingFaceTrendingResponse>(
          `${apiUrl}/api/trending`,
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
