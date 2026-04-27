import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('metrics')
@UseGuards(AuthGuard)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get metrics summary' })
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.metricsService.getSummary(user.id);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly metrics' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  getMonthly(
    @Query('year') year: number,
    @Query('month') month: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.metricsService.getMonthly(year, month, user.id);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly metrics' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  getYearly(@Query('year') year: number, @CurrentUser() user: AuthenticatedUser) {
    return this.metricsService.getYearly(year, user.id);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two years' })
  @ApiQuery({ name: 'currentYear', required: true, type: Number })
  @ApiQuery({ name: 'previousYear', required: true, type: Number })
  compare(
    @Query('currentYear') currentYear: number,
    @Query('previousYear') previousYear: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.metricsService.compare(currentYear, previousYear, user.id);
  }
}
