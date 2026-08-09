import { BadRequestException, Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { TrendService } from './trend.service.js';

import 'reflect-metadata';
@Controller('trends')
export class TrendController {
  constructor(private readonly trendService: TrendService) { }

  // @Get()
  // async getTrending(@Query(new ValidationPipe()) query:GetTrendsQueryDto) {
  //   // return this.trendService.getTrending();

  //  console.log(query);
  //    console.log(query);
  //    console.log(typeof query.page);
  // console.log(typeof query.limit);
  // return query;

  //   // return {
  //   //   success: true,
  //   //   data: await this.trendService.getTrending(query),
  //   //   pagination:{
  //   //     page: query.page,
  //   //     limit:query.limit,
  //   //   },
  //   //   timestamp: new Date().toISOString(),
  //   // }
  // }


  @Get()
async getTrending(
  @Query('page') page = '1',
  @Query('limit') limit = '20',
  @Query('topic') topic = 'artificial-intelligence',
  @Query('language') language?: string,
  @Query('sort') sort: 'stars' | 'updated' = 'stars',
) {   
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new BadRequestException('page must be a positive integer');
  }

  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    throw new BadRequestException('limit must be between 1 and 100');
  }

  return {
    success: true,
    data: await this.trendService.getTrending({
      page: pageNumber,
      limit: limitNumber,
      topic,
      language,
      sort,
    }),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
    },
    timestamp: new Date().toISOString(),
  };
}

  @Get("metadata")
  metadata() {
    console.log(
      Reflect.getMetadata(
        'design:paramtypes',
        TrendController.prototype,
        'getTrending',
      ),
    );

    return 'ok';
  }
}
