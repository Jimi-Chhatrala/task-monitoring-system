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
  annual_target_tasks: number;
  annual_target_score: number;
  created_at: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Task {
  id: string;
  user_id: string;
  ticket_number: string;
  description: string;
  jira_link: string | null;
  priority: Priority;
  status: TaskStatus;
  production_live_date: Date | null;
  is_locked: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface TimeLog {
  id: string;
  task_id: string;
  hours: number;
  comment: string | null;
  created_by: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: Date;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  created_at: Date;
}

export interface MetricsSummary {
  total_tasks: number;
  completed_tasks: number;
  total_hours: number;
  total_score: number;
  average_productivity: number;
}

export interface MonthlyMetrics {
  month: number;
  year: number;
  tasks_completed: number;
  hours_logged: number;
  score: number;
}

export interface YearlyMetrics {
  year: number;
  tasks_completed: number;
  hours_logged: number;
  score: number;
  productivity: number;
}

export interface Insight {
  type: 'productivity' | 'efficiency' | 'workload' | 'priority' | 'consistency';
  message: string;
  change?: number;
}
