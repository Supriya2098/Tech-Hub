import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCustomerInput, CustomerListQuery, UpdateCustomerInput } from '@techhub/shared-types';
import * as customersApi from './api';

const CUSTOMERS_KEY = 'customers';

export function useCustomers(query: CustomerListQuery) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, query],
    queryFn: () => customersApi.listCustomers(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersApi.createCustomer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) => customersApi.updateCustomer(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}
