import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TimeLog, Comment, TaskHistory, User } from '../../database/models';
import { TaskStatus, Priority, CreateTaskDto, UpdateTaskDto, CreateTimeLogDto, CreateCommentDto } from './dto/task.dto';

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  [Priority.HIGHEST]: 5,
  [Priority.HIGH]: 4,
  [Priority.MEDIUM]: 3,
  [Priority.LOW]: 2,
  [Priority.LOWEST]: 1,
};

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.ON_HOLD],
  [TaskStatus.REVIEW]: [TaskStatus.TESTING, TaskStatus.REOPEN, TaskStatus.ON_HOLD],
  [TaskStatus.TESTING]: [TaskStatus.READY_TO_LIVE, TaskStatus.REOPEN, TaskStatus.ON_HOLD],
  [TaskStatus.READY_TO_LIVE]: [TaskStatus.DONE, TaskStatus.REOPEN],
  [TaskStatus.ON_HOLD]: [],
  [TaskStatus.REOPEN]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.DONE]: [],
};

export function isValidStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
  previousStatus?: TaskStatus,
): boolean {
  if (newStatus === TaskStatus.ON_HOLD && previousStatus) {
    return Object.values(TaskStatus).includes(previousStatus);
  }

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];
  return allowedTransitions.includes(newStatus);
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(TimeLog) private readonly timeLogModel: typeof TimeLog,
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(TaskHistory) private readonly taskHistoryModel: typeof TaskHistory,
  ) {}

  async findAll(user_id?: string) {
    const tasks = await this.taskModel.findAll({
      where: user_id ? { user_id } : {},
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
      }],
    });
    return tasks.map(this.mapToTask);
  }

  async findOne(id: string) {
    const task = await this.taskModel.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: TimeLog, order: [['created_at', 'DESC']] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'name'] }],
          order: [['created_at', 'DESC']] },
      ],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.mapToTask(task);
  }

  async create(dto: CreateTaskDto) {
    const task = await this.taskModel.create({
      user_id: dto.user_id,
      ticket_number: dto.ticket_number,
      description: dto.description,
      jira_link: dto.jira_link,
      priority: dto.priority,
      production_live_date: dto.production_live_date ? new Date(dto.production_live_date) : undefined,
    });
    return this.mapToTask(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    previousStatus?: TaskStatus,
  ) {
    const task = await this.taskModel.findByPk(id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.is_locked) {
      throw new BadRequestException('Task is locked and cannot be updated');
    }

    if (dto.status && previousStatus) {
      if (!isValidStatusTransition(task.status as TaskStatus, dto.status, previousStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${task.status} to ${dto.status}`,
        );
      }
    } else if (dto.status) {
      if (!isValidStatusTransition(task.status as TaskStatus, dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${task.status} to ${dto.status}`,
        );
      }
    }

    await task.update({
      ticket_number: dto.ticket_number,
      description: dto.description,
      jira_link: dto.jira_link,
      priority: dto.priority,
      status: dto.status,
      production_live_date: dto.production_live_date ? new Date(dto.production_live_date) : undefined,
      completed_at: dto.status === TaskStatus.DONE ? new Date() : undefined,
      is_locked: dto.status === TaskStatus.DONE ? true : undefined,
    });

    if (dto.status) {
      await this.taskHistoryModel.create({
        task_id: id,
        field: 'status',
        old_value: task.status,
        new_value: dto.status,
        changed_by: 'system',
      });
    }

    return this.mapToTask(task);
  }

  async updateStatus(
    id: string,
    newStatus: TaskStatus,
    previousStatus: TaskStatus,
  ) {
    return this.update(id, { status: newStatus }, previousStatus);
  }

  async delete(id: string) {
    const task = await this.taskModel.findByPk(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await task.destroy();
  }

  async addTimeLog(dto: CreateTimeLogDto & { task_id: string }, user_id: string) {
    const task = await this.taskModel.findByPk(dto.task_id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${dto.task_id} not found`);
    }

    return this.timeLogModel.create({
      task_id: dto.task_id,
      hours: dto.hours,
      comment: dto.comment,
      created_by: user_id,
    });
  }

  async addComment(dto: CreateCommentDto & { task_id: string }, user_id: string) {
    const task = await this.taskModel.findByPk(dto.task_id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${dto.task_id} not found`);
    }

    return this.commentModel.create({
      task_id: dto.task_id,
      user_id: user_id,
      comment: dto.comment,
    });
  }

  async getTimeLogs(task_id: string) {
    return this.timeLogModel.findAll({
      where: { task_id },
      order: [['created_at', 'DESC']],
    });
  }

  async getComments(task_id: string) {
    return this.commentModel.findAll({
      where: { task_id },
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name'] }],
    });
  }

  private mapToTask(task: Task): any {
    return {
      id: task.id,
      user_id: task.user_id,
      ticket_number: task.ticket_number,
      description: task.description,
      jira_link: task.jira_link,
      priority: task.priority,
      status: task.status,
      production_live_date: task.production_live_date,
      is_locked: task.is_locked,
      completed_at: task.completed_at,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}