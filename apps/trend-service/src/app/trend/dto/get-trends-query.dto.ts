import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTrendsQueryDto {
  @IsOptional()
  @IsString()
  topic?: string = 'artificial-intelligence';

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(['stars', 'updated'])
  sort: 'stars' | 'updated' = 'stars';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;
}
