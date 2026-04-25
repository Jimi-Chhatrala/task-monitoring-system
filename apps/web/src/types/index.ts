export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  READY_TO_LIVE = 'READY_TO_LIVE',
  ON_HOLD = 'ON_HOLD',
  REOPEN = 'REOPEN',
  DONE = 'DONE',
}

export enum Priority {
  HIGHEST = 'HIGHEST',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  LOWEST = 'LOWEST',
}

export interface User {
  id: string;
  name: string;
  email: string;
  annualTargetTasks: number;
  annualTargetScore: number;
  createdAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  ticketNumber: string;
  description: string;
  jiraLink: string | null;
  priority: Priority;
  status: TaskStatus;
  productionLiveDate: Date | null;
  isLocked: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeLog {
  id: string;
  taskId: string;
  hours: number;
  comment: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: Date;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  createdAt: Date;
}

export interface MetricsSummary {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  totalScore: number;
  averageProductivity: number;
}

export interface MonthlyMetrics {
  month: number;
  year: number;
  tasksCompleted: number;
  hoursLogged: number;
  score: number;
}

export interface YearlyMetrics {
  year: number;
  tasksCompleted: number;
  hoursLogged: number;
  score: number;
  productivity: number;
}

export interface Insight {
  type: 'productivity' | 'efficiency' | 'workload' | 'priority' | 'consistency';
  message: string;
  change?: number;
}
