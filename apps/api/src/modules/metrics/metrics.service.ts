import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Task, TimeLog } from '../../database/models';
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
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(TimeLog) private readonly timeLogModel: typeof TimeLog,
  ) {}

  async getSummary(user_id?: string) {
    const tasks = await this.taskModel.findAll({
      where: user_id ? { user_id } : {},
    });

    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.DONE,
    );
    const totalScore = completedTasks.reduce(
      (sum, t) => sum + (PRIORITY_WEIGHTS[t.priority] || 0),
      0,
    );
    const timeLogs = await this.timeLogModel.findAll({
      where: user_id ? { '$task.user_id$': user_id } : {},
      include: [Task],
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
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      total_hours: totalHours,
      total_score: totalScore,
      average_productivity: averageProductivity,
    };
  }

  async getMonthly(year: number, month: number, user_id?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const tasks = await this.taskModel.findAll({
      where: {
        completed_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        status: TaskStatus.DONE,
        ...(user_id && { user_id }),
      },
    });

    const timeLogs = await this.timeLogModel.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        ...(user_id && { '$task.user_id$': user_id }),
      },
      include: [Task],
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
        tasks_completed: tasks.length,
        hours_logged: hours,
        score,
      },
    ];
  }

  async getYearly(year: number, user_id?: string) {
    const startDate = new Date(year - 1, 6, 1);
    const endDate = new Date(year, 6, 0, 23, 59, 59);

    const tasks = await this.taskModel.findAll({
      where: {
        completed_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        status: TaskStatus.DONE,
        ...(user_id && { user_id }),
      },
    });

    const timeLogs = await this.timeLogModel.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        ...(user_id && { '$task.user_id$': user_id }),
      },
      include: [Task],
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
        tasks_completed: tasks.length,
        hours_logged: hours,
        score,
        productivity: days > 0 ? Math.round((score / days) * 100) / 100 : 0,
      },
    ];
  }

  async compare(
    currentYear: number,
    previousYear: number,
    user_id?: string,
  ) {
    const [current, previous] = await Promise.all([
      this.getYearly(currentYear, user_id),
      this.getYearly(previousYear, user_id),
    ]);

    return {
      current: current[0] || {
        year: currentYear,
        tasks_completed: 0,
        hours_logged: 0,
        score: 0,
        productivity: 0,
       },
       previous: previous[0] || {
        year: previousYear,
        tasks_completed: 0,
        hours_logged: 0,
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