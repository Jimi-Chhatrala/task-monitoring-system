import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TimeLog, Comment, TaskHistory, User } from '../../database/models';

@Module({
  imports: [SequelizeModule.forFeature([Task, TimeLog, Comment, TaskHistory, User])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
