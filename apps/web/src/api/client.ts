import { TaskStatus, Task, MetricsSummary, MonthlyMetrics, Insight } from '../types';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${VITE_API_URL}/api`;

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  tasks: {
    getAll: (user_id?: string) =>
      fetchApi<Task[]>(`/tasks${user_id ? `?user_id=${user_id}` : ''}`),
    getOne: (id: string) => fetchApi<Task>(`/tasks/${id}`),
    create: (data: any) =>
      fetchApi<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any, previousStatus?: TaskStatus) =>
      fetchApi<Task>(
        `/tasks/${id}${previousStatus ? `?previousStatus=${previousStatus}` : ''}`,
        { method: 'PUT', body: JSON.stringify(data) },
      ),
    updateStatus: (id: string, newStatus: TaskStatus, previousStatus: TaskStatus) =>
      fetchApi<Task>(`/tasks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ newStatus, previousStatus }),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
    addTimeLog: (task_id: string, data: any, user_id: string) =>
      fetchApi<any>(`/tasks/${task_id}/time-logs?user_id=${user_id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addComment: (task_id: string, data: any, user_id: string) =>
      fetchApi<any>(`/tasks/${task_id}/comments?user_id=${user_id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getComments: (task_id: string) => fetchApi<any[]>(`/tasks/${task_id}/comments`),
  },
  users: {
    getAll: () => fetchApi<any[]>('/users'),
    getOne: (id: string) => fetchApi<any>(`/users/${id}`),
    create: (data: any) =>
      fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  metrics: {
    getSummary: (user_id?: string) =>
      fetchApi<MetricsSummary>(`/metrics/summary${user_id ? `?user_id=${user_id}` : ''}`),
    getMonthly: (year: number, month: number, user_id?: string) =>
      fetchApi<MonthlyMetrics[]>(
        `/metrics/monthly?year=${year}&month=${month}${user_id ? `&user_id=${user_id}` : ''}`,
      ),
    getYearly: (year: number, user_id?: string) =>
      fetchApi<any[]>(`/metrics/yearly?year=${year}${user_id ? `&user_id=${user_id}` : ''}`),
  },
  insights: {
    getAll: (user_id?: string) =>
      fetchApi<Insight[]>(`/insights${user_id ? `?user_id=${user_id}` : ''}`),
  },
};
