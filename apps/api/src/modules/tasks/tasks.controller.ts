import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateTimeLogDto, CreateCommentDto, TaskStatus } from './dto/task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.tasksService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Query('previousStatus') previousStatus?: TaskStatus,
  ) {
    return this.tasksService.update(id, updateTaskDto, previousStatus);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  updateStatus(
    @Param('id') id: string,
    @Body('newStatus') newStatus: TaskStatus,
    @Body('previousStatus') previousStatus: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, newStatus, previousStatus);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @Post(':id/time-logs')
  @ApiOperation({ summary: 'Add time log to a task' })
  addTimeLog(
    @Param('id') taskId: string,
    @Body() createTimeLogDto: CreateTimeLogDto,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.addTimeLog({ ...createTimeLogDto, taskId }, userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to a task' })
  addComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Query('userId') userId: string,
  ) {
    return this.tasksService.addComment({ ...createCommentDto, taskId }, userId);
  }

  @Get(':id/time-logs')
  @ApiOperation({ summary: 'Get time logs for a task' })
  getTimeLogs(@Param('id') taskId: string) {
    return this.tasksService.getTimeLogs(taskId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a task' })
  getComments(@Param('id') taskId: string) {
    return this.tasksService.getComments(taskId);
  }
}
