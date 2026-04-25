import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskStatus } from '../tasks/dto/task.dto';

const PRIORITY_WEIGHTS: Record<string, number> = {
  HIGHEST: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  LOWEST: 1,
};

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId?: string) {
    const where = userId ? { userId } : {};
    const tasks = await this.prisma.task.findMany({ where });

    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.DONE,
    );
    const totalScore = completedTasks.reduce(
      (sum, t) => sum + (PRIORITY_WEIGHTS[t.priority] || 0),
      0,
    );
    const timeLogs = await this.prisma.timeLog.findMany({
      where: userId ? { task: { userId } } : {},
    });
    const totalHours = timeLogs.reduce(
      (sum, log) => sum + Number(log.hours),
      0,
    );
    const daysElapsed = this.getDaysElapsed();
    const averageProductivity = daysElapsed > 0
      ? Math.round((totalScore / daysElapsed) * 100) / 100
      : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalHours,
      totalScore,
      averageProductivity,
    };
  }

  async getMonthly(year: number, month: number, userId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where: any = {
      completedAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(userId && { userId }),
    };

    const tasks = await this.prisma.task.findMany({
      where: { ...where, status: TaskStatus.DONE },
    });

    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(userId && { task: { userId } }),
      },
    });

    const score = tasks.reduce(
      (sum, t) => sum + (PRIORITY_WEIGHTS[t.priority] || 0),
      0,
    );
    const hours = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0);

    return [
      {
        month,
        year,
        tasksCompleted: tasks.length,
        hoursLogged: hours,
        score,
      },
    ];
  }

  async getYearly(year: number, userId?: string) {
    const startDate = new Date(year - 1, 6, 1);
    const endDate = new Date(year, 6, 0, 23, 59, 59);

    const where: any = {
      completedAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(userId && { userId }),
    };

    const tasks = await this.prisma.task.findMany({
      where: { ...where, status: TaskStatus.DONE },
    });

    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(userId && { task: { userId } }),
      },
    });

    const score = tasks.reduce(
      (sum, t) => sum + (PRIORITY_WEIGHTS[t.priority] || 0),
      0,
    );
    const hours = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0);
    const days = hours / 8;

    return [
      {
        year,
        tasksCompleted: tasks.length,
        hoursLogged: hours,
        score,
        productivity: days > 0 ? Math.round((score / days) * 100) / 100 : 0,
      },
    ];
  }

  async compare(
    currentYear: number,
    previousYear: number,
    userId?: string,
  ) {
    const [current, previous] = await Promise.all([
      this.getYearly(currentYear, userId),
      this.getYearly(previousYear, userId),
    ]);

    return {
      current: current[0] || {
        year: currentYear,
        tasksCompleted: 0,
        hoursLogged: 0,
        score: 0,
        productivity: 0,
      },
      previous: previous[0] || {
        year: previousYear,
        tasksCompleted: 0,
        hoursLogged: 0,
        score: 0,
        productivity: 0,
      },
    };
  }

  private getDaysElapsed(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
