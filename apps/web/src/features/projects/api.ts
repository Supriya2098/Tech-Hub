import type { ApiSuccess, CreateProjectInput, ProjectListQuery, UpdateProjectInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Project {
  id: string;
  organizationId: string;
  customerId: string | null;
  customer: { id: string; name: string } | null;
  name: string;
  description: string | null;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  budget: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
}

export async function listProjects(query: ProjectListQuery): Promise<ApiSuccess<Project[]>> {
  const { data } = await api.get('/projects', { params: query });
  return data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data } = await api.post('/projects', input);
  return data.data;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}`, input);
  return data.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
