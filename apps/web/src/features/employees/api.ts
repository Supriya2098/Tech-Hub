import type { ApiSuccess, CreateEmployeeInput, EmployeeListQuery, UpdateEmployeeInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Employee {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  department: string | null;
  title: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  salary: string | null;
  hiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listEmployees(query: EmployeeListQuery): Promise<ApiSuccess<Employee[]>> {
  const { data } = await api.get('/employees', { params: query });
  return data;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { data } = await api.post('/employees', input);
  return data.data;
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  const { data } = await api.patch(`/employees/${id}`, input);
  return data.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/employees/${id}`);
}
