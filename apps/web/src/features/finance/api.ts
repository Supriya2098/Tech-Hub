import type {
  ApiSuccess,
  CreateInvoiceInput,
  CreatePaymentInput,
  InvoiceListQuery,
  UpdateInvoiceInput,
} from '@techhub/shared-types';
import { api } from '@/lib/axios';

export interface Payment {
  id: string;
  amount: string;
  method: string;
  paidAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  customer: { id: string; name: string };
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  amount: string;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export async function listInvoices(query: InvoiceListQuery): Promise<ApiSuccess<Invoice[]>> {
  const { data } = await api.get('/finance/invoices', { params: query });
  return data;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const { data } = await api.post('/finance/invoices', input);
  return data.data;
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const { data } = await api.patch(`/finance/invoices/${id}`, input);
  return data.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/finance/invoices/${id}`);
}

export async function recordPayment(invoiceId: string, input: CreatePaymentInput): Promise<Payment> {
  const { data } = await api.post(`/finance/invoices/${invoiceId}/payments`, input);
  return data.data;
}
