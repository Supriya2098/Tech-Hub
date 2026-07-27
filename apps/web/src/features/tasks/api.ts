import type { ApiSuccess, CreateTaskInput, TaskListQuery, UpdateTaskInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  project: { id: string; name: string };
  employeeId: string | null;
  employee: { id: string; name: string } | null;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listTasks(query: TaskListQuery): Promise<ApiSuccess<Task[]>> {
  const { data } = await api.get('/tasks', { params: query });
  return data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post('/tasks', input);
  return data.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const { data } = await api.patch(`/tasks/${id}`, input);
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
