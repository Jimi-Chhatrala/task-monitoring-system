import { TaskStatus, Task, MetricsSummary, MonthlyMetrics, Insight } from '../types';

const API_BASE = '/api';

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
    getAll: (userId?: string) =>
      fetchApi<Task[]>(`/tasks${userId ? `?userId=${userId}` : ''}`),
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
    addTimeLog: (taskId: string, data: any, userId: string) =>
      fetchApi<any>(`/tasks/${taskId}/time-logs?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addComment: (taskId: string, data: any, userId: string) =>
      fetchApi<any>(`/tasks/${taskId}/comments?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getComments: (taskId: string) => fetchApi<any[]>(`/tasks/${taskId}/comments`),
  },
  users: {
    getAll: () => fetchApi<any[]>('/users'),
    getOne: (id: string) => fetchApi<any>(`/users/${id}`),
    create: (data: any) =>
      fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  metrics: {
    getSummary: (userId?: string) =>
      fetchApi<MetricsSummary>(`/metrics/summary${userId ? `?userId=${userId}` : ''}`),
    getMonthly: (year: number, month: number, userId?: string) =>
      fetchApi<MonthlyMetrics[]>(
        `/metrics/monthly?year=${year}&month=${month}${userId ? `&userId=${userId}` : ''}`,
      ),
    getYearly: (year: number, userId?: string) =>
      fetchApi<any[]>(`/metrics/yearly?year=${year}${userId ? `&userId=${userId}` : ''}`),
  },
  insights: {
    getAll: (userId?: string) =>
      fetchApi<Insight[]>(`/insights${userId ? `?userId=${userId}` : ''}`),
  },
};
