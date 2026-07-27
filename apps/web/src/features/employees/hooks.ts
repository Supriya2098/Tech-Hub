import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEmployeeInput, EmployeeListQuery, UpdateEmployeeInput } from '@techhub/shared-types';
import * as employeesApi from './api';

const EMPLOYEES_KEY = 'employees';

export function useEmployees(query: EmployeeListQuery) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, query],
    queryFn: () => employeesApi.listEmployees(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.createEmployee(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) => employeesApi.updateEmployee(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  });
}
