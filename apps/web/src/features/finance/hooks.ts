import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateInvoiceInput, CreatePaymentInput, InvoiceListQuery, UpdateInvoiceInput } from '@techhub/shared-types';
import * as financeApi from './api';

const INVOICES_KEY = 'invoices';

export function useInvoices(query: InvoiceListQuery) {
  return useQuery({
    queryKey: [INVOICES_KEY, query],
    queryFn: () => financeApi.listInvoices(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => financeApi.createInvoice(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoiceInput }) => financeApi.updateInvoice(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, input }: { invoiceId: string; input: CreatePaymentInput }) =>
      financeApi.recordPayment(invoiceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
