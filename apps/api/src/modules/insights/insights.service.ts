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

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInsights(userId?: string) {
    const currentYear = new Date().getFullYear();
    const comparison = await this.compareYears(
      currentYear,
      currentYear - 1,
      userId,
    );

    const insights: any[] = [];

    insights.push(...this.analyzeProductivity(comparison));
    insights.push(...this.analyzeEfficiency(comparison));
    insights.push(...this.analyzeWorkload(comparison));
    insights.push(...(await this.analyzePriorityDistribution(userId)));

    return insights;
  }

  async compareYears(
    currentYear: number,
    previousYear: number,
    userId?: string,
  ) {
    const current = await this.getYearData(currentYear, userId);
    const previous = await this.getYearData(previousYear, userId);

    return { current, previous };
  }

  private async getYearData(year: number, userId?: string) {
    const startDate = new Date(year - 1, 6, 1);
    const endDate = new Date(year, 6, 0, 23, 59, 59);

    const where: any = {
      completedAt: { gte: startDate, lte: endDate },
      status: TaskStatus.DONE,
      ...(userId && { userId }),
    };

    const tasks = await this.prisma.task.findMany({ where });

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

    return {
      year,
      tasksCompleted: tasks.length,
      hoursLogged: hours,
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
      comparison.current.hoursLogged,
      comparison.previous.hoursLogged,
    );
    const taskChange = calculateGrowth(
      comparison.current.tasksCompleted,
      comparison.previous.tasksCompleted,
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
      comparison.current.tasksCompleted,
      comparison.previous.tasksCompleted,
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

  private async analyzePriorityDistribution(userId?: string): Promise<any[]> {
    const insights: any[] = [];
    const where = userId
      ? { userId, status: TaskStatus.DONE }
      : { status: TaskStatus.DONE };

    const tasks = await this.prisma.task.findMany({ where });
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
