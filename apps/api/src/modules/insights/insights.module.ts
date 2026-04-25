import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { Task, TimeLog } from '../../database/models';

@Module({
  imports: [SequelizeModule.forFeature([Task, TimeLog])],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
