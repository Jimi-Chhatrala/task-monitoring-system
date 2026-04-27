import {
  TaskStatus,
  Task,
  MetricsSummary,
  MonthlyMetrics,
  Insight,
  AuthResponse,
  User,
} from '../types';

const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${VITE_API_URL}/api`;
const AUTH_STORAGE_KEY = 'task-monitoring-auth';

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken || null;
  } catch {
    return null;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      if (!window.location.hash.includes('/auth')) {
        window.location.hash = '/auth';
      }
    }

    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      fetchApi<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => fetchApi<User>('/auth/me'),
  },
  tasks: {
    getAll: () => fetchApi<Task[]>('/tasks'),
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
    addTimeLog: (task_id: string, data: any) =>
      fetchApi<any>(`/tasks/${task_id}/time-logs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addComment: (task_id: string, data: any) =>
      fetchApi<any>(`/tasks/${task_id}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getComments: (task_id: string) => fetchApi<any[]>(`/tasks/${task_id}/comments`),
  },
  users: {
    getAll: () => fetchApi<any[]>('/users'),
    getOne: (id: string) => fetchApi<any>(`/users/${id}`),
    me: () => fetchApi<User>('/users/me'),
    create: (data: any) =>
      fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  metrics: {
    getSummary: () => fetchApi<MetricsSummary>('/metrics/summary'),
    getMonthly: (year: number, month: number) =>
      fetchApi<MonthlyMetrics[]>(`/metrics/monthly?year=${year}&month=${month}`),
    getYearly: (year: number) =>
      fetchApi<any[]>(`/metrics/yearly?year=${year}`),
  },
  insights: {
    getAll: () => fetchApi<Insight[]>('/insights'),
  },
};
