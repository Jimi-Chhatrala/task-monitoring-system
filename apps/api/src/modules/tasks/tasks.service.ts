import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus, Priority } from './dto/task.dto';

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

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return tasks.map(this.mapToTask);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        timeLogs: { orderBy: { createdAt: 'desc' } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.mapToTask(task);
  }

  async create(dto: any) {
    const task = await this.prisma.task.create({
      data: {
        userId: dto.userId,
        ticketNumber: dto.ticketNumber,
        description: dto.description,
        jiraLink: dto.jiraLink,
        priority: dto.priority,
        productionLiveDate: dto.productionLiveDate ? new Date(dto.productionLiveDate) : undefined,
      },
    });
    return this.mapToTask(task);
  }

  async update(
    id: string,
    dto: any,
    previousStatus?: TaskStatus,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.isLocked) {
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

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        completedAt: dto.status === TaskStatus.DONE ? new Date() : undefined,
        isLocked: dto.status === TaskStatus.DONE ? true : undefined,
      },
    });

    if (dto.status) {
      await this.prisma.taskHistory.create({
        data: {
          taskId: id,
          field: 'status',
          oldValue: task.status,
          newValue: dto.status,
          changedBy: 'system',
        },
      });
    }

    return this.mapToTask(updatedTask);
  }

  async updateStatus(
    id: string,
    newStatus: TaskStatus,
    previousStatus: TaskStatus,
  ) {
    return this.update(id, { status: newStatus }, previousStatus);
  }

  async delete(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.prisma.task.delete({ where: { id } });
  }

  async addTimeLog(dto: any, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${dto.taskId} not found`);
    }

    return this.prisma.timeLog.create({
      data: {
        taskId: dto.taskId,
        hours: dto.hours,
        comment: dto.comment,
        createdBy: userId,
      },
    });
  }

  async addComment(dto: any, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${dto.taskId} not found`);
    }

    return this.prisma.comment.create({
      data: {
        taskId: dto.taskId,
        userId,
        comment: dto.comment,
      },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async getTimeLogs(taskId: string) {
    return this.prisma.timeLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  private mapToTask(prismaTask: any): any {
    return {
      id: prismaTask.id,
      userId: prismaTask.userId,
      ticketNumber: prismaTask.ticketNumber,
      description: prismaTask.description,
      jiraLink: prismaTask.jiraLink,
      priority: prismaTask.priority,
      status: prismaTask.status,
      productionLiveDate: prismaTask.productionLiveDate,
      isLocked: prismaTask.isLocked,
      completedAt: prismaTask.completedAt,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    };
  }
}
