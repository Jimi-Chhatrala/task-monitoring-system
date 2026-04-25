import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Task, TimeLog } from '../../database/models';

@Module({
  imports: [SequelizeModule.forFeature([Task, TimeLog])],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
