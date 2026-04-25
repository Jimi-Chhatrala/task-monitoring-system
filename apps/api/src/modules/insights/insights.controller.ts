import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Generate insights based on historical data' })
  @ApiQuery({ name: 'userId', required: false })
  generateInsights(@Query('userId') userId?: string) {
    return this.insightsService.generateInsights(userId);
  }
}
