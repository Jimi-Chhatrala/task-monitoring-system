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

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(TimeLog) private readonly timeLogModel: typeof TimeLog,
  ) {}

  async generateInsights(user_id?: string) {
    const currentYear = new Date().getFullYear();
    const comparison = await this.compareYears(
      currentYear,
      currentYear - 1,
      user_id,
    );

    const insights: any[] = [];

    insights.push(...this.analyzeProductivity(comparison));
    insights.push(...this.analyzeEfficiency(comparison));
    insights.push(...this.analyzeWorkload(comparison));
    insights.push(...(await this.analyzePriorityDistribution(user_id)));

    return insights;
  }

  async compareYears(
    currentYear: number,
    previousYear: number,
    user_id?: string,
  ) {
    const current = await this.getYearData(currentYear, user_id);
    const previous = await this.getYearData(previousYear, user_id);

    return { current, previous };
  }

  private async getYearData(year: number, user_id?: string) {
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

    return {
      year,
      tasks_completed: tasks.length,
      hours_logged: hours,
      score,
      productivity: days > 0 ? Math.round((score / days) * 100) / 100 : 0,
    };
  }

  private analyzeProductivity(comparison: any): any[] {
    const insights: any[] = [];
    const change = calculateGrowth(
      comparison.current.productivity,
      comparison.previous.productivity,
    );

    if (Math.abs(change) > 10) {
      insights.push({
        type: 'productivity',
        message:
          change > 0
            ? `Productivity up ${change}% vs last year`
            : `Productivity down ${Math.abs(change)}% vs last year`,
        change,
      });
    }

    return insights;
  }

  private analyzeEfficiency(comparison: any): any[] {
    const insights: any[] = [];
    const hourChange = calculateGrowth(
      comparison.current.hours_logged,
      comparison.previous.hours_logged,
    );
    const taskChange = calculateGrowth(
      comparison.current.tasks_completed,
      comparison.previous.tasks_completed,
    );

    if (hourChange > 20 && taskChange < 5) {
      insights.push({
        type: 'efficiency',
        message: 'More hours logged but similar task output - check for inefficiencies',
        change: hourChange - taskChange,
      });
    }

    return insights;
  }

  private analyzeWorkload(comparison: any): any[] {
    const insights: any[] = [];
    const change = calculateGrowth(
      comparison.current.tasks_completed,
      comparison.previous.tasks_completed,
    );

    if (change > 25) {
      insights.push({
        type: 'workload',
        message: `Workload increased by ${change}%`,
        change,
      });
    } else if (change < -15) {
      insights.push({
        type: 'workload',
        message: `Workload decreased by ${Math.abs(change)}%`,
        change,
      });
    }

    return insights;
  }

  private async analyzePriorityDistribution(user_id?: string): Promise<any[]> {
    const insights: any[] = [];

    const tasks = await this.taskModel.findAll({
      where: user_id
        ? { user_id, status: TaskStatus.DONE }
        : { status: TaskStatus.DONE },
    });
    if (tasks.length === 0) return insights;

    const highPriority = tasks.filter((t) =>
      ['HIGHEST', 'HIGH'].includes(t.priority),
    ).length;
    const ratio = highPriority / tasks.length;

    if (ratio > 0.6) {
      insights.push({
        type: 'priority',
        message: 'Heavy focus on high-priority tasks (over 60%)',
        change: Math.round(ratio * 100),
      });
    }

    return insights;
  }
}