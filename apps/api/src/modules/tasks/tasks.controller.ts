import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateTimeLogDto, CreateCommentDto, TaskStatus } from './dto/task.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('tasks')
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
    @Query('previousStatus') previousStatus?: TaskStatus,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id, previousStatus);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: TaskStatus,
    @Body('previousStatus') previousStatus: TaskStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.updateStatus(id, newStatus, previousStatus, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.delete(id, user.id);
  }

  @Post(':id/time-logs')
  @ApiOperation({ summary: 'Add time log to a task' })
  addTimeLog(
    @Param('id') task_id: string,
    @Body() createTimeLogDto: CreateTimeLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.addTimeLog({ ...createTimeLogDto, task_id }, user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to a task' })
  addComment(
    @Param('id') task_id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.addComment({ ...createCommentDto, task_id }, user.id);
  }

  @Get(':id/time-logs')
  @ApiOperation({ summary: 'Get time logs for a task' })
  getTimeLogs(@Param('id') task_id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.getTimeLogs(task_id, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a task' })
  getComments(@Param('id') task_id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.getComments(task_id, user.id);
  }
}
