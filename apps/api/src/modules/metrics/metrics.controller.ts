import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get metrics summary' })
  @ApiQuery({ name: 'userId', required: false })
  getSummary(@Query('userId') userId?: string) {
    return this.metricsService.getSummary(userId);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly metrics' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'userId', required: false })
  getMonthly(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('userId') userId?: string,
  ) {
    return this.metricsService.getMonthly(year, month, userId);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly metrics' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'userId', required: false })
  getYearly(@Query('year') year: number, @Query('userId') userId?: string) {
    return this.metricsService.getYearly(year, userId);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two years' })
  @ApiQuery({ name: 'currentYear', required: true, type: Number })
  @ApiQuery({ name: 'previousYear', required: true, type: Number })
  @ApiQuery({ name: 'userId', required: false })
  compare(
    @Query('currentYear') currentYear: number,
    @Query('previousYear') previousYear: number,
    @Query('userId') userId?: string,
  ) {
    return this.metricsService.compare(currentYear, previousYear, userId);
  }
}
