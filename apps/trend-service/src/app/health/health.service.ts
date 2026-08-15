import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getService(): string {
    return 'trend-service';
  }
}
