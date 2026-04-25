import { Priority, Task, TaskStatus } from '@repo/types';

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  [Priority.HIGHEST]: 5,
  [Priority.HIGH]: 4,
  [Priority.MEDIUM]: 3,
  [Priority.LOW]: 2,
  [Priority.LOWEST]: 1,
};

export function getFinancialYear(date: Date): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month >= 6 ? year + 1 : year;
}

export function calculateWeightedScore(tasks: Task[]): number {
  return tasks.reduce((score, task) => {
    if (task.status !== TaskStatus.DONE) return score;
    return score + PRIORITY_WEIGHTS[task.priority];
  }, 0);
}

export function calculateProductivity(score: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round((score / days) * 100) / 100;
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

export function convertHoursToDays(hours: number): number {
  const HOURS_PER_DAY = 8;
  return Math.round((hours / HOURS_PER_DAY) * 100) / 100;
}

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
  previousStatus?: TaskStatus
): boolean {
  if (newStatus === TaskStatus.ON_HOLD && previousStatus) {
    return Object.values(TaskStatus).includes(previousStatus);
  }

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}
