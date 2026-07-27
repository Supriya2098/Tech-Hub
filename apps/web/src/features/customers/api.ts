import type { ApiSuccess, CreateCustomerInput, CustomerListQuery, UpdateCustomerInput } from '@techhub/shared-types';
import { api } from '@/lib/axios';

// The Prisma-generated `Customer` type isn't exported from shared-types (it only
// holds request/response contracts), so the row shape used by the UI is declared
// locally to mirror what the API actually returns.
export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'CHURNED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listCustomers(query: CustomerListQuery): Promise<ApiSuccess<Customer[]>> {
  const { data } = await api.get('/customers', { params: query });
  return data;
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const { data } = await api.post('/customers', input);
  return data.data;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  const { data } = await api.patch(`/customers/${id}`, input);
  return data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
